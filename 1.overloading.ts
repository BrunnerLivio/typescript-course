////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FUNCTION OVERLOADING
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type IUser = {
  name: string;
  role: string;
  permissions: string[];
};

function getRole(user: { role: "user" } & IUser): "user";
function getRole(user: { role: "admin" } & IUser): "admin";
function getRole(user: IUser) {
  switch (user.role) {
    case "admin":
      return "admin";
    case "user":
      return "user";
  }
}

const role = getRole({ role: "user", name: "John", permissions: [] });