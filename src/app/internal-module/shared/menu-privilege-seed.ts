import { PrivilegeDto } from '../../core/models';

const SCREENS: readonly {
  rootId: number;
  addId: number;
  editId: number;
  queryId: number;
  nameAr: string;
  nameOt: string;
}[] = [
  { rootId: 1000, addId: 1001, editId: 1002, queryId: 1003, nameAr: 'الرئيسية', nameOt: 'Home' },
  { rootId: 1010, addId: 1011, editId: 1012, queryId: 1013, nameAr: 'المستخدمون', nameOt: 'Users' },
  { rootId: 1020, addId: 1021, editId: 1022, queryId: 1023, nameAr: 'أدوار المستخدمين', nameOt: 'User roles' },
  { rootId: 1030, addId: 1031, editId: 1032, queryId: 1033, nameAr: 'أنواع الخدمات', nameOt: 'Service types' },
  { rootId: 1040, addId: 1041, editId: 1042, queryId: 1043, nameAr: 'أنواع التكامل', nameOt: 'Integration types' },
  { rootId: 1050, addId: 1051, editId: 1052, queryId: 1053, nameAr: 'أنواع المرفقات', nameOt: 'Attachment types' },
  { rootId: 1060, addId: 1061, editId: 1062, queryId: 1063, nameAr: 'سير العمل', nameOt: 'Workflow' }
];

function childLabel(screen: (typeof SCREENS)[number], kind: 'add' | 'edit' | 'query'): { ar: string; en: string } {
  switch (kind) {
    case 'add':
      return { ar: `إضافة — ${screen.nameAr}`, en: `Add — ${screen.nameOt}` };
    case 'edit':
      return { ar: `تعديل — ${screen.nameAr}`, en: `Edit — ${screen.nameOt}` };
    case 'query':
      return { ar: `استعلام — ${screen.nameAr}`, en: `Query — ${screen.nameOt}` };
  }
}

export function buildMenuPrivilegeSeed(): PrivilegeDto[] {
  const now = new Date().toISOString();
  const base = { createdBy: 0, createdDate: now };
  const list: PrivilegeDto[] = [];
  for (const s of SCREENS) {
    list.push({ ...base, id: s.rootId, privilegeName: s.nameAr, privilegeNameEn: s.nameOt });
    const add = childLabel(s, 'add');
    const edit = childLabel(s, 'edit');
    const query = childLabel(s, 'query');
    list.push(
      { ...base, id: s.addId, parentId: s.rootId, privilegeName: add.ar, privilegeNameEn: add.en },
      { ...base, id: s.editId, parentId: s.rootId, privilegeName: edit.ar, privilegeNameEn: edit.en },
      { ...base, id: s.queryId, parentId: s.rootId, privilegeName: query.ar, privilegeNameEn: query.en }
    );
  }
  return list;
}
