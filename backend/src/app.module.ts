import { Module, Provider, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CocktailsModule } from './cocktails/cocktails.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { CategoriesModule } from './categories/categories.module';
import { GlassTypesModule } from './glass-types/glass-types.module';
import { SearchModule } from './search/search.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { Cocktail } from './entities/cocktail.entity';
import { PaperlessService } from './services/paperless.service';
import { PaperlessController } from './controllers/paperless.controller';
import { CocktailsController } from './cocktails/cocktails.controller';

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
    GlassTypesModule,
    SearchModule,
    ProductsModule,
    AuthModule,
  ],
  controllers: [AppController, PaperlessController, CocktailsController],
  providers: [
    AppService,
    PaperlessService,
    {
      provide: 'APP_PIPE',
      useClass: ValidationPipe,
    },
  ] as Provider[],
})
export class AppModule {}
