export enum JobType {
    Intern = "intern",
    FullTime = "fullTime",
    PartTime = "partTime",
    Contractual = "contractual",
};

export enum USER_ROLE {
    SuperAdmin = "SuperAdmin",
    Admin = "Admin",
    Employee = "Employee",
    HR = "HR",
    Manager = "Manager",
}

export enum TActivityStatus {
    Active = "active",
    Blocked = "blocked",
    Archieved = "archieved",
}

export enum WorkMode {
    Onsite = "onsite",
    Remote = "remote",
    Hybrid = "hybrid",
};

export enum PerformanceRating {
    Excellent = "excellent",
    Good = "good",
    Average = "average",
    BelowAverage = "below average",
    Poor = "poor",
};

export enum LeaveTypeName {
    AnnualLeave = "annualLeave",
    SickLeave = "sickLeave",
    CasualLeave = "casualLeave",
    PaternityLeave = "paternityLeave",
    MaternityLeave = "maternityLeave",
    CompensatoryLeave = "compensatoryLeave",
    PaidLeave = "paidLeave",
    MarriageLeave = "marriageLeave",
    EducationLeave = "educationLeave",
    EmergencyLeave = "emergencyLeave",
    AdjustmentLeave = "adjustmentLeave",
};

export enum BloodGroup {
    "A+" = 'A+',
    "B+" = 'B+',
    "AB+" = 'AB+',
    "O+" = 'O+',
    "A-" = 'A-',
    "B-" = 'B-',
    "AB-" = 'AB-',
    "O-'" = 'O-',
};

export enum Gender {
    Male = "male",
    Female = "female",
    Other = "other",
};

export enum MaritalStatus {
    Single = "single",
    Married = "married",
};

export type TName = {
    firstName: string;
    lastName: string;
    fullName: string;
};