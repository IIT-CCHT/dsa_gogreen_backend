const menu = [
  {
    label: "Home",
    name:"home",
    icon:"home",
    path:"/private",
    roles: ["*"]
  },
  {
    label: "Materials",
    name:"materials",
    icon:"puzzle",
    path:"/private/materials",
    roles: ["*"]
  },
  {
    label: "Users",
    name:"users",
    icon:"users",
    path:"/private/users",
    roles: ["*"]
  },
  {
    label: "Roles",
    name:"roles",
    icon:"roles",
    path:"/private/roles",
    roles: ["Bigone"]
  },
  {
    label: "Settings",
    name:"settings",
    icon:"gear",
    path:"/private/settings",
    roles: ["Bigone"]
  }
]

module.exports = {
  menu
}