export enum FieldType {
  Number = 1,
  Text = 2,
  Date = 3,
  DateTime = 4,
  DropDown = 5,
  Time = 6
}

export const FIELD_TYPE_OPTIONS: readonly {
  value: FieldType;
  labelAr: string;
  labelOt: string;
}[] = [
  { value: FieldType.Number, labelAr: 'رقم', labelOt: 'Number' },
  { value: FieldType.Text, labelAr: 'نص', labelOt: 'Text' },
  { value: FieldType.Date, labelAr: 'تاريخ', labelOt: 'Date' },
  { value: FieldType.DateTime, labelAr: 'تاريخ ووقت', labelOt: 'DateTime' },
  { value: FieldType.DropDown, labelAr: 'قائمة', labelOt: 'DropDown' },
  { value: FieldType.Time, labelAr: 'وقت', labelOt: 'Time' }
];
