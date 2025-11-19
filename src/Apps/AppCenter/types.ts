export interface App {
    id: string;
    name: string;
    description: string;
    fullDescription?: string;
    icon: string;
    category: string;
    tags?: string[];
    screenshots?: string[];
    releaseDate?: string;
    technologies?: string[];
    trial?: string;
    github?: string;
    canTry?: boolean;
    featured?: boolean;
    image?: string;
}
