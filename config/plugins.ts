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
      }
});