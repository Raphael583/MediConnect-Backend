import { Document} from "mongoose";
export interface Hospital extends Document{

    readonly name:string;
   readonly address: string;
  readonly phone: string;
  readonly email: string;
}