/** Screen permission GUIDs from Petra API (backend spelling: permssions). */
export const Permissions = {
  Users: '290e16c2-a7b1-4d0b-b3f3-0f57a7c01d4b',
  AddUsers: '3968aa5a-3e35-46c0-8641-117d9b597ec8',
  EditUsers: '0f2791a2-19fb-4a18-8a98-137475022d0b',
  Roles: '0c77a6e3-0940-4e69-8f74-2bcf509ad362',
  UserRoles: '0c77a6e3-0940-4e69-8f74-2bcf509ad362',
  AddUserRoles: '519d7649-4ada-4165-93b8-3e0bb6b0821b',
  EditUserRoles: '8c008721-154b-4b45-b6ef-45c29612190e',
  AssignedPrivilages: '8eb26e43-b8b1-4b3d-8f21-486e64438347',
  Groups: '009c98bc-0bc5-4c31-9e1b-48e48446e875',
  Applications: '55fb1d9e-3d83-455b-be7a-5674365bfd15',
  AddApks: '3be80f97-c1e7-4426-b75c-84dc4f96d9c9',
  EditApks: 'a66cb3d5-abfb-4693-8147-85359613adcd',
  Settings: 'a4985efa-61e6-4007-bdeb-8f683c364755',
  EditSettings: '9bf678b6-7b31-459f-a21d-95aa3eaad8e1',
  Notifications: 'b1e6d375-43fa-4d49-8e72-9709248e0d6c'
} as const;

export const SettingValueType = {
  IsMedia: 1,
  Email: 2,
  Number: 3,
  Boolean: 4,
  Text: 5
} as const;

/** @deprecated Use {@link Permissions} */
export class Enums {
  static readonly Permssions = Permissions;
  static readonly Modules = {
    User: 'User',
    Role: 'Role',
    RolePrivilege: 'RolePrivilege',
    UserRole: 'UserRole',
    UserGroup: 'UserGroup',
    Group: 'Group',
    Applications: 'Applications',
    Notification: 'Notification',
    Privilege: 'Privilege',
    Setting: 'Setting'
  };
}
