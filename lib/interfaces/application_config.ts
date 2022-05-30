export interface HashMap {
    [key: string]: string
}

export interface Validator {
    id: string
    envVars: HashMap
}