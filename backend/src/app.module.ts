import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CocktailsModule } from './cocktails/cocktails.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { CategoriesModule } from './categories/categories.module';
import { Cocktail } from './entities/cocktail.entity';
import { PaperlessService } from './services/paperless.service';
import { PaperlessController } from './controllers/paperless.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Cocktail]),
    DatabaseModule,
    CocktailsModule,
    IngredientsModule,
    CategoriesModule,
  ],
  controllers: [AppController, PaperlessController],
  providers: [AppService, PaperlessService] as Provider[],
})
export class AppModule {}
