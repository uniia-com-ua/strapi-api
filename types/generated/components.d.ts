import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksAboutUs extends Struct.ComponentSchema {
  collectionName: 'components_blocks_about_uses';
  info: {
    displayName: 'about-us';
  };
  attributes: {
    Cards: Schema.Attribute.Component<'blocks.info-card', true>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksInfoBanner extends Struct.ComponentSchema {
  collectionName: 'components_blocks_info_banners';
  info: {
    displayName: 'info-banner';
    icon: 'monitor';
  };
  attributes: {
    background: Schema.Attribute.Media<'images'>;
    Buttons: Schema.Attribute.Component<'shared.button', true>;
    subtitle: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'\u041F\u0435\u0440\u0448\u0430 \u043E\u043D\u043B\u0430\u0439\u043D-\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0434\u043B\u044F \u0441\u0442\u0443\u0434\u0435\u043D\u0442\u0456\u0432 \u0443\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0438\u0445 \u0443\u043D\u0456\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0456\u0432'>;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'\u041A\u0430\u0440\u0431\u0443\u0439 \u043E\u0441\u0432\u0456\u0442\u0443'>;
  };
}

export interface BlocksInfoCard extends Struct.ComponentSchema {
  collectionName: 'components_blocks_info_cards';
  info: {
    displayName: 'info-card';
  };
  attributes: {
    Buttons: Schema.Attribute.Component<'shared.button', true>;
    description: Schema.Attribute.RichText;
    media: Schema.Attribute.Media<'images' | 'videos'>;
    sx: Schema.Attribute.JSON;
    title: Schema.Attribute.String;
  };
}

export interface BlocksOurTeam extends Struct.ComponentSchema {
  collectionName: 'components_blocks_our_teams';
  info: {
    displayName: 'our-team';
  };
  attributes: {
    card: Schema.Attribute.Component<'blocks.info-card', false>;
    Media: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    title: Schema.Attribute.String;
  };
}

export interface SharedAppBar extends Struct.ComponentSchema {
  collectionName: 'components_shared_app_bars';
  info: {
    displayName: 'App Bar';
    icon: 'bulletList';
  };
  attributes: {
    LoginButton: Schema.Attribute.Component<'shared.button', false>;
    Tabs: Schema.Attribute.Component<'shared.button', true>;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
    icon: 'cursor';
  };
  attributes: {
    isGlass: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'\u041A\u043D\u043E\u043F\u043A\u0430'>;
    link: Schema.Attribute.String & Schema.Attribute.DefaultTo<'/'>;
    rounded: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    size: Schema.Attribute.Enumeration<['small', 'medium', 'large']> &
      Schema.Attribute.DefaultTo<'medium'>;
    sx: Schema.Attribute.JSON;
    variant: Schema.Attribute.Enumeration<['contained', 'outlined', 'text']> &
      Schema.Attribute.DefaultTo<'contained'>;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {};
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.about-us': BlocksAboutUs;
      'blocks.info-banner': BlocksInfoBanner;
      'blocks.info-card': BlocksInfoCard;
      'blocks.our-team': BlocksOurTeam;
      'shared.app-bar': SharedAppBar;
      'shared.button': SharedButton;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
