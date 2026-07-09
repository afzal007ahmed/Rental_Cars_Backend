import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Availability } from "./models/availability.model";

@Module({
    imports : [SequelizeModule.forFeature([Availability])] ,
    exports : [] ,
    providers : [] ,
    controllers : []
})
export class AvailabilityModule{}