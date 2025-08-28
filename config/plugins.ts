import type { Config as AppVersionConfig } from 'strapi-plugin-app-version/dist/server/src/config'

import packageJson from '../package.json'

export default ({ env }) => ({
    email: {
        config: {
          provider: 'strapi-provider-email-brevo',
          providerOptions: {
            apiKey: env('BREVO_API_KEY'),
          },
          settings: {
            defaultSenderEmail: 'support@uniia.com.ua',
            defaultSenderName: 'Унія',
            defaultReplyTo: 'support@uniia.com.ua',
          },
        },
      },
      'app-version': {
        enabled: true,
        config: {
        version: packageJson.version,
        } satisfies AppVersionConfig,
    },
});