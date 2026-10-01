import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { UnitModule } from './unit/unit.module';
import { UploadModule } from './upload/upload.module';
import { LeaseModule } from './lease/lease.module';
import { PaymentModule } from './payment/payment.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [AuthModule, PropertyModule, UnitModule, UploadModule, LeaseModule, PaymentModule, ApplicationModule], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
