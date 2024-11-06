import WebSocket from "ws";
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload, verify } from "jsonwebtoken";
import { UserActions } from "./UserActions";
import { JWT_SECRET } from "../lib/config";


export class User {

    public id: string
    private spaceId?: string;
    private x: number;
    private y: number;



    constructor(private ws: WebSocket) {
        this.ws = ws;
        this.id = uuidv4();
        this.x = 0;
        this.y = 0;
        this.initialize()
    }



    initialize() {
        this.ws.on("message", async (data: WebSocket.RawData) => {


            const parsed = JSON.parse(data.toString())


            console.log(parsed)
            switch (parsed.type) {
                case "join": {
                    let tokenString = parsed.payload.token;
                    let token = tokenString.split(" ")[1];
                    let decoded = verify(token, JWT_SECRET) as JwtPayload;
                    if (!decoded || !decoded.id) {
                        this.ws.close();
                        return;
                    }
                    this.id = decoded.id;
                    console.log(`User ${this.id} joined the space, ${this.id}`);

                    UserActions.addUser(parsed, this)
                    break;
                }
                case "move": {
                    UserActions.userMove(parsed, this)
                    break;
                }

                default: {

                    break;
                }
            }

        })
    }


    send(message: object) {
        this.ws.send(JSON.stringify(message));
    }


    close() {
        this.ws.close();
    }


    destroy() {
        this.ws.close();
        UserActions.destroy({
            type: "user-leave",
            payload: {
                id: this.id,
                spaceId: this.spaceId!
            }
        }, this);
    }



    setSpaceid(id: string) {
        this.spaceId = id;
    }

    getSpaceid() {
        return this.spaceId;
    }


    setPosition(xPos: number, yPos: number) {
        this.x = xPos;
        this.y = yPos
    }


    getPosition() {
        return [this.x, this.y]
    }

}





