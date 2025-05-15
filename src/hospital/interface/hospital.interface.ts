import { Document} from "mongoose";
export interface Hospital extends Document{

    readonly name:string;
    readonly age:number;
    readonly disease:string;
    readonly admitted:boolean;
}