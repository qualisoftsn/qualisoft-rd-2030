export enum SSEType {
  ACCIDENT_TRAVAIL = 'ACCIDENT_TRAVAIL',
  ACCIDENT_TRAJET = 'ACCIDENT_TRAJET',
  PRESQU_ACCIDENT = 'PRESQU_ACCIDENT',
  SITUATION_DANGEREUSE = 'SITUATION_DANGEREUSE',
  DOMMAGE_MATERIEL = 'DOMMAGE_MATERIEL',
  INCIDENT_ENVIRONNEMENTAL = 'INCIDENT_ENVIRONNEMENTAL'
}

export interface ReportEvent {
  id?: string;
  type: SSEType;
  dateHeure: string;
  lieu: string;
  description: string;
  avecArret?: boolean;
  nbJoursArret?: number;
  causesImmediates?: string;
}