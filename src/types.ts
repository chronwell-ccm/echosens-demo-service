export interface GetOrgsHeaders {
  'x-echosens-api-key': string
}

export interface GetOrgQueryString {
  email: string
}

export interface PostPatientHeader {
  'x-chronwell-signature': string
}

export interface Patient {
  orgId: string
  medicalRecordNumber: string
  createdAt: string
  updatedAt: string
  firstName: string
  lastName: string
  middleName: string
  dob: string
  gender: string
  email: string
  homePhoneNumber: string
  mobilePhoneNumber: string
  workPhoneNumber: string
  address: {
    line1: string
    line2: string
    city: string
    state: string
    zip: string
    country: string
  }
  primaryInsurance: string
  medicalHistory: Array<{
    code: string
    description: string
    date: string
  }>
  labResults: Array<{
    code: string
    unit: string
    value: number
    date: string
  }>
  labOrderDate: string
  fib4Score: number
  fib4Risk: string
  fibroScanScheduleDate: string
  fibroScanCompletedDate: string
}
