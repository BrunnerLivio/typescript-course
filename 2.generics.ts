////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// GENERICS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import axios from "axios";

type Pagination<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

type User = {
  name: string;
};

axios
  .get<Pagination<User>>("https://reqres.in/api/users?page=2")
  .then((data) => data.data.items.map((user) => user.name));