import { Essay, Product, PrayerItem } from '../types';

export type AdminTab = 
  | 'overview' 
  | 'blog' 
  | 'store' 
  | 'prayers' 
  | 'saints' 
  | 'churches' 
  | 'pages' 
  | 'settings';

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  instagramUrl: string;
  youtubeUrl: string;
  announcementBanner: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
  homeHeroQuote: {
    text: string;
    author: string;
  };
}

export interface PageContentCMS {
  aboutText: string;
  missionStatement: string;
  termsText: string;
  privacyText: string;
  conductText: string;
}
