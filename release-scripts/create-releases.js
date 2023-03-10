/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const libNameIndex = process.argv.indexOf("-lib", 1);
const libName = libNameIndex >= 0 ? process.argv[libNameIndex + 1] : null;
const { Octokit } = require("@octokit/rest");
const dotenv = require("dotenv");
const semver = require("semver");

dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_AUTH
});

const { graphql } = require("@octokit/graphql");
const graphqlWithAuth = graphql.defaults({
    headers: {
        authorization: `token ${process.env.GITHUB_AUTH}`,
        'GraphQL-Features': 'discussions_api'
    },
});

const repoMeta = {
    owner: "AzureAD",
    repo: "microsoft-authentication-library-for-js"
};

const defaultLibFolders = [
    "lib/msal-angular",
    "lib/msal-browser",
    "lib/msal-common",
    "lib/msal-core",
    "lib/msal-node",
    "lib/msal-react",
    "extensions/msal-node-extensions"
];
const CHANGELOGFILE = "CHANGELOG.json";

function buildNotesForComments(commits, label) {
    return [
        `### ${label}`,
        "",
        ...commits.map(commit => `- ${commit.comment} (${commit.author})`),
        ""
    ];
}

async function createGithubMilestone(name, version) {
    const title = `${name}@${version}`;

    try {
        // Next patch milestone
        const nextPatchMilestone = await octokit.issues.createMilestone({
            ...repoMeta,
            title
        });
        console.log(`Milestone created: ${title}`);
    } catch (e) {
        console.log(`Milestone exists: ${title}`);
    }
}

async function closeOldMilestones(name, version) {
    // List all open github milestones
    const milestones = await octokit.issues.listMilestones({
        ...repoMeta,
        state: "open"
    });

    for (let i=0; i < milestones.data.length; i++) {
        const milestone = milestones.data[i];

        // Find all milestones matching this library
        if (milestone.title.startsWith(name)) {
            const [milestoneVersion] = milestone.title.split("@").slice(-1);

            if (milestoneVersion === version) {
                // Milestone associated with this release
                try {
                    await octokit.issues.updateMilestone({
                        ...repoMeta,
                        milestone_number: milestone.number,
                        state: "closed"
                    });
                    console.log(`Milestone closed: ${name}@${version}`);
                } catch (e) {
                    console.log(`Failed to close: ${name}@${version}`);
                }
            } else if (semver.lt(milestoneVersion, version)) {
                // Milestone associated with a release that was skipped (i.e. patch release that got superseded by minor bump)
                try {
                    await octokit.issues.deleteMilestone({
                        ...repoMeta,
                        milestone_number: milestone.number
                    });
                    console.log(`Milestone Deleted: ${name}@${milestoneVersion}`);
                } catch (e) {
                    console.log(`Failed to delete: ${name}@${milestoneVersion}`);
                }
            }
        }
    };
}

async function createReleaseForFolder(folderName) {
    const {
        name,
        entries: [
            {
                date,
                tag,
                version,
                comments: {
                    major,
                    minor,
                    patch,
                    none,
                    prerelease
                }
            }
        ]
    } = require(`../${folderName}/${CHANGELOGFILE}`);

    const shortName = name.split("@azure/").pop();
    const tag_name = `${shortName}-v${version}`;

    let body = [
        `## ${version}`,
        "",
        date,
        ""
    ];

    if (major) {
        body = body.concat(buildNotesForComments(major, "Major changes"));
    }

    if (minor) {
        body = body.concat(buildNotesForComments(minor, "Minor changes"));
    }

    if (patch) {
        body = body.concat(buildNotesForComments(patch, "Patches"));
    }

    if (prerelease) {
        body = body.concat(buildNotesForComments(prerelease, "Changes"));
    }

    const release = {
        ...repoMeta,
        tag_name,
        name: `${name} v${version}`,
        prerelease: !!prerelease,
        body: body.join("\n")
    };

    // Gets latest releases and checks if there is a matching releases for the given library version
    // TODO: improve check to handle release not being on the first page
    const allReleases = await octokit.repos.listReleases(repoMeta);
    const releaseForTag = allReleases.data.find(existingRelease => existingRelease.name === release.name);

    if (!releaseForTag) {
        console.log(`Release started: ${tag_name}`);

        const {
            createDiscussion: {
                discussion: {
                    url: discussionUrl
                }
            }
        } = await graphqlWithAuth(
            `mutation {
                createDiscussion(input: {
                    body: "${release.body}", 
                    title: "${release.name}", 
                    repositoryId: "MDEwOlJlcG9zaXRvcnk4MzA4NTU3OQ==", 
                    categoryId: "MDE4OkRpc2N1c3Npb25DYXRlZ29yeTMyMDEyMzMy"
                }) {
                    discussion {
                        url
                    }
                }
            }`
        );

        release.body = `${release.body}\nDiscussion: ${discussionUrl}`;

        // Create github release
        const newRelease = await octokit.repos.createRelease(release);
        console.log(`Release created: ${tag_name}`);

        // Close old milestones
        await closeOldMilestones(name, version);

        const currentVersion = new semver.SemVer(version);

        // Next patch milestone
        const nextPatchVersion = semver.inc(currentVersion.raw, "patch");
        await createGithubMilestone(name, nextPatchVersion);

        if (currentVersion.prerelease.length) {
            // Next prerelease milestone
            const nextPrereleaseVersion = semver.inc(currentVersion.raw, "prerelease")
            await createGithubMilestone(name, nextPrereleaseVersion);
        } else {
            // Next minor milestone
            const nextMinorVersion = semver.inc(currentVersion.raw, "minor")
            await createGithubMilestone(name, nextMinorVersion);
        }
    } else {
        console.log(`Release exists for: ${tag_name}`);
    }
}

const libFolders = libName ? [libName] : defaultLibFolders;

Promise.all(libFolders.map(createReleaseForFolder))
    .then(result => {
        process.exit(0);
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });