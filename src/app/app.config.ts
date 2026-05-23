import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideRouter } from '@angular/router';

import { definePreset } from '@primeuix/themes';

import Aura from '@primeuix/themes/aura';

import { providePrimeNG } from 'primeng/config';



import { authInterceptor } from './core/auth.interceptor';

import { routes } from './app.routes';



const AppThemePreset = definePreset(Aura, {

  semantic: {

    primary: {

      50: '#fff8f2',

      100: '#ffedd5',

      200: '#fddaa8',

      300: '#fcbc71',

      400: '#ef7f1a',

      500: '#d96d0f',

      600: '#b85a0d',

      700: '#964a0f',

      800: '#964a0f',

      900: '#7c3f12',

      950: '#431f07'

    }

  }

});



export const appConfig: ApplicationConfig = {

  providers: [

    provideBrowserGlobalErrorListeners(),

    provideZoneChangeDetection({ eventCoalescing: true }),

    provideAnimationsAsync(),

    providePrimeNG({

      ripple: true,

      theme: {

        preset: AppThemePreset,

        options: {

          darkModeSelector: '.dark-mode'

        }

      }

    }),

    provideRouter(routes),

    provideHttpClient(withInterceptors([authInterceptor]))

  ]

};

