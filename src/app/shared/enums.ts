/** Permission id — numeric ids from Petra.BE Permssions.cs */
export type PermissionId = number | string;

/** Screen permissions from Petra API (backend spelling: permssions). */
export const Permissions = {
  Users: 1,
  AddUsers: 2,
  EditUsers: 3,
  AssignedRoles: 4,
  AssignedGroups: 5,
  UserRoles: 7,
  AddUserRoles: 8,
  EditUserRoles: 9,
  AssignedPrivilages: 10,
  Roles: 7,
  Groups: 11,
  Applications: 12,
  AddApks: 13,
  EditApks: 14,
  Settings: 15,
  EditSettings: 16,
  Notifications: 17,
  RequestType: 42,
  AddRequestType: 43,
  EditRequestType: 44,
  IntegrationType: 45,
  AddIntegrationType: 46,
  EditIntegrationType: 47,
  AttachmentType: 48,
  AddAttachmentType: 49,
  EditAttachmentType: 50,
  RequestDetail: 51,
  RequestTypeAttachment: 52,
  WorkFlowDefinition: 53,
  AddWorkFlowDefinition: 54,
  EditWorkFlowDefinition: 55
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
