export interface HashMap {
    [key: string]: string
}

export interface Validator {
    id: string
    envVars: HashMap
}

export interface Pipeline {
    accountId: string,
    region: string
}