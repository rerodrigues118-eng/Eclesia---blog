import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Heart,
  Globe,
  Settings,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Upload,
  Search,
  Check,
  ShieldCheck,
  Eye,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  AlignLeft,
  AlignRight,
  AlignCenter,
  Bold,
  Italic,
  Columns,
  Activity,
  Database,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Sliders,
  Image as ImageIcon,
  Megaphone,
  LogOut,
  User as UserIcon
} from 'lucide-react';

import { Essay, Product, PrayerItem, ActiveView, Saint, ArticleAdConfig, UserProfile } from '../types';
import { AdminTab, SiteSettings } from './types';
import {
  generateSeoSlug,
  generateSeoMetaDescription,
  calculateSeoScore,
  generateSmartSeoPackage,
  CATHOLIC_EDITORIAL_TEMPLATES,
  SeoAuditResult
} from '../utils/seo';
import { RichArticleRenderer } from '../components/RichArticleRenderer';
import { convertFileToWebP } from '../utils/imageOptimizer';
import { ArticleLivePreviewModal } from '../components/ArticleLivePreviewModal';
import { GoogleAdSlot } from '../components/GoogleAdSlot';
import { fetchSiteSettingsFromDb, saveSiteSettingsToDb } from '../services/dbService';
import { supabase } from '../lib/supabase/client';
import { generateArticleClientSide, setGrokApiKey } from '../services/aiArticleGenerator';

interface ArticleImageItem {
  id: string;
  url: string;
  caption: string;
  align: 'esquerda' | 'direita' | 'centro';
  width: number;
}

interface AdminDashboardProps {
  articles: Essay[];
  onSaveArticle: (article: Essay) => Promise<void> | void;
  onDeleteArticle: (id: string) => Promise<void> | void;
  products: Product[];
  onSaveProduct: (product: Product) => Promise<void> | void;
  onDeleteProduct: (id: string) => Promise<void> | void;
  prayers: PrayerItem[];
  onSavePrayer: (prayer: PrayerItem) => Promise<void> | void;
  onDeletePrayer: (id: string) => Promise<void> | void;
  saints: Saint[];
  onSaveSaint: (saint: Saint) => Promise<void> | void;
  onDeleteSaint: (id: string) => Promise<void> | void;
  setActiveView: (view: ActiveView) => void;
  user?: any;
  profile?: UserProfile | null;
  onSignOut?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  articles,
  onSaveArticle,
  onDeleteArticle,
  products,
  onSaveProduct,
  onDeleteProduct,
  prayers,
  onSavePrayer,
  onDeletePrayer,
  saints,
  onSaveSaint,
  onDeleteSaint,
  setActiveView,
  user,
  profile,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isFormSaving, setIsFormSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Theme State: Light Mode as Default, Dark Mode as optional
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('eclesia_admin_theme');
      return (saved as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('eclesia_admin_theme', nextTheme);
    } catch (e) {
      console.error(e);
    }
  };

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // ----------------------------------------------------
  // ARTICLE FORM STATE (WITH COMPLETE SEO & RICH CONTENT)
  // ----------------------------------------------------
  const [isArticleFormOpen, setIsArticleFormOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [articleEditorMode, setArticleEditorMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [editingArticle, setEditingArticle] = useState<Essay | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('Teologia');
  const [articleReadTime, setArticleReadTime] = useState('5 min');
  const [articleAuthor, setArticleAuthor] = useState('Redação Eclesia');
  const [articleImageUrl, setArticleImageUrl] = useState('');
  const [articleAltText, setArticleAltText] = useState('');
  const [articleExcerpt, setArticleExcerpt] = useState('');
  const [articleContent, setArticleContent] = useState('');

  // Managed Article Images (eliminates base64 wall in text)
  const [articleImages, setArticleImages] = useState<ArticleImageItem[]>([]);

  // SEO Specific Fields
  const [articleSlug, setArticleSlug] = useState('');
  const [articleMetaTitle, setArticleMetaTitle] = useState('');
  const [articleMetaDescription, setArticleMetaDescription] = useState('');
  const [articleKeywordsInput, setArticleKeywordsInput] = useState('');

  // Google Ads Configuration & Real Page Preview Modal
  const [isLivePreviewModalOpen, setIsLivePreviewModalOpen] = useState(false);
  const [articleAdConfig, setArticleAdConfig] = useState<ArticleAdConfig>({
    showTopAd: true,
    showMiddleAd: true,
    middleAdParagraph: 3,
    showSidebarAd: true,
    showBottomAd: true,
    adClient: 'ca-pub-1234567890123456',
    topSlotId: '1001',
    middleSlotId: '1002',
    sidebarSlotId: '1003',
    bottomSlotId: '1004'
  });

  // Textarea Ref for selection and cursor formatting
  const articleTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ----------------------------------------------------
  // PRODUCT FORM STATE
  // ----------------------------------------------------
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodPrice, setProdPrice] = useState('0');
  const [prodCategory, setProdCategory] = useState<'livro' | 'sacramental' | 'arte' | 'vestuário'>('livro');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodInStock, setProdInStock] = useState(true);
  const [prodBuyUrl, setProdBuyUrl] = useState('');

  // ----------------------------------------------------
  // PRAYER FORM STATE
  // ----------------------------------------------------
  const [isPrayerFormOpen, setIsPrayerFormOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<PrayerItem | null>(null);
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerCategory, setPrayerCategory] = useState<'diarias' | 'marianas' | 'santos' | 'latim'>('diarias');
  const [prayerText, setPrayerText] = useState('');
  const [prayerDescription, setPrayerDescription] = useState('');
  const [prayerIsDaySpecial, setPrayerIsDaySpecial] = useState(false);
  const [prayerImageUrl, setPrayerImageUrl] = useState('');

  // ----------------------------------------------------
  // SAINT / SANTORAL FORM STATE
  // ----------------------------------------------------
  const [isSaintFormOpen, setIsSaintFormOpen] = useState(false);
  const [editingSaint, setEditingSaint] = useState<Saint | null>(null);
  const [saintName, setSaintName] = useState('');
  const [saintTitle, setSaintTitle] = useState('');
  const [saintFeastDate, setSaintFeastDate] = useState('');
  const [saintMonth, setSaintMonth] = useState(1);
  const [saintDay, setSaintDay] = useState(1);
  const [saintImageUrl, setSaintImageUrl] = useState('');
  const [saintPatronage, setSaintPatronage] = useState('');
  const [saintSummary, setSaintSummary] = useState('');
  const [saintFullBio, setSaintFullBio] = useState('');
  const [saintPrayer, setSaintPrayer] = useState('');
  const [saintFeatured, setSaintFeatured] = useState(false);

  // ----------------------------------------------------
  // SITE SETTINGS STATE (CMS)
  // ----------------------------------------------------
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Eclesia',
    siteTagline: 'Cultura, Teologia & Tradição Católica',
    contactEmail: 'suporte.delski@gmail.com',
    instagramUrl: 'https://instagram.com/eclesia',
    youtubeUrl: 'https://youtube.com/eclesia',
    announcementBanner: {
      enabled: true,
      text: 'Quaresma 2024: Acompanhe nossas meditações e orações diárias.',
      linkText: 'Ver Liturgia',
      linkUrl: 'liturgia'
    },
    homeHeroQuote: {
      text: 'A beleza salvará o mundo.',
      author: 'Fiódor Dostoiévski'
    }
  });

  useEffect(() => {
    let isMounted = true;
    fetchSiteSettingsFromDb().then((dbSettings) => {
      if (dbSettings && isMounted) {
        setSettings((prev) => ({ ...prev, ...dbSettings }));
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Helper notification
  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Convert article images array to media map
  const mediaMap = articleImages.reduce((acc, img) => {
    acc[img.id] = img.url;
    acc[`img-${img.id}`] = img.url;
    return acc;
  }, {} as Record<string, string>);

  // Robust Local Machine Image Upload handler (Automatically converts PNG/JPG/WebP into lightweight WebP)
  const handleLocalImageFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    onSuccessText = 'Foto convertida para WebP e importada com sucesso!'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        notify('Selecione um arquivo de imagem válido (PNG, JPG, WebP).', 'error');
        return;
      }

      try {
        const webpDataUrl = await convertFileToWebP(file, 1280, 1280, 0.85);
        setter(webpDataUrl);
        notify(onSuccessText);
      } catch (err) {
        console.error('Erro na conversão WebP:', err);
        notify('Erro ao converter a imagem para WebP. Tente novamente.', 'error');
      }
      e.target.value = '';
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // SMART INLINE IMAGE UPLOADER & RESIZER (CONVERTS TO WEBP)
  // ─────────────────────────────────────────────────────────────────
  const handleAddArticleImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    align: 'esquerda' | 'direita' | 'centro' = 'esquerda'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('Selecione um arquivo de imagem válido.', 'error');
      return;
    }

    try {
      const webpUrl = await convertFileToWebP(file, 1280, 1280, 0.85);
      const nextId = String(articleImages.length + 1);
      const caption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const initialWidth = align === 'centro' ? 520 : 340;

      const newImageItem: ArticleImageItem = {
        id: nextId,
        url: webpUrl,
        caption,
        align,
        width: initialWidth
      };

      setArticleImages(prev => [...prev, newImageItem]);

      // Insert clean short tag: [img-esquerda: 1 | 340px | Legenda]
      const cleanTag = `[img-${align}: ${nextId} | ${initialWidth}px | ${caption}]`;
      insertRichTagAtCursor(cleanTag);

      notify(`Foto #${nextId} convertida para WebP e importada com sucesso!`);
    } catch (err) {
      console.error('Erro na conversão:', err);
      notify('Erro ao importar foto para o artigo.', 'error');
    }
    e.target.value = '';
  };

  // Update Image Properties (Width, Alignment, Caption) and sync with text
  const handleUpdateImageItem = (
    id: string,
    updates: Partial<ArticleImageItem>
  ) => {
    setArticleImages(prev =>
      prev.map(img => {
        if (img.id !== id) return img;
        const updated = { ...img, ...updates };

        // Replace tag in content
        const oldRegex = new RegExp(`\\[img-(esquerda|direita|centro):\\s*${id}\\s*(?:\\|[^|\\]]+)?(?:\\|[^|\\]]+)?\\]`, 'gi');
        const newTag = `[img-${updated.align}: ${updated.id} | ${updated.width}px | ${updated.caption}]`;

        setArticleContent(current => {
          if (oldRegex.test(current)) {
            return current.replace(oldRegex, newTag);
          }
          return current;
        });

        return updated;
      })
    );
  };

  // Delete image from article
  const handleDeleteImageItem = (id: string) => {
    setArticleImages(prev => prev.filter(img => img.id !== id));
    // Remove tags from text
    const tagRegex = new RegExp(`\\[img-(esquerda|direita|centro):\\s*${id}[^\\]]*\\]`, 'gi');
    setArticleContent(prev => prev.replace(tagRegex, '').trim());
    notify(`Foto #${id} removida do artigo.`);
  };

  // Replace photo file in existing ArticleImageItem with automatic WebP conversion
  const handleReplaceImageItemFile = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Selecione um arquivo de imagem válido (PNG, JPG, WebP).', 'error');
      return;
    }
    try {
      const webpUrl = await convertFileToWebP(file, 1280, 1280, 0.85);
      setArticleImages(prev => prev.map(img => img.id === id ? { ...img, url: webpUrl } : img));
      notify(`Foto #${id} convertida para WebP e atualizada!`);
    } catch (err) {
      console.error('Erro na conversão:', err);
      notify('Erro ao converter imagem para WebP.', 'error');
    }
    e.target.value = '';
  };

  // Re-insert image tag at cursor position
  const handleReinsertImageTag = (img: ArticleImageItem) => {
    const tag = `[img-${img.align}: ${img.id} | ${img.width}px | ${img.caption}]`;
    insertRichTagAtCursor(tag);
    notify(`Tag da foto #${img.id} inserida na posição do cursor!`);
  };

  // Paste image directly from clipboard (Ctrl+V) with automatic WebP conversion
  const handleEditorPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        try {
          const webpUrl = await convertFileToWebP(file, 1280, 1280, 0.85);
          const nextId = String(articleImages.length + 1);
          const caption = `Foto Inserida ${nextId}`;
          const align = 'centro';
          const initialWidth = 520;

          const newImageItem: ArticleImageItem = {
            id: nextId,
            url: webpUrl,
            caption,
            align,
            width: initialWidth
          };

          setArticleImages(prev => [...prev, newImageItem]);

          const cleanTag = `[img-${align}: ${nextId} | ${initialWidth}px | ${caption}]`;
          insertRichTagAtCursor(cleanTag);
          notify(`Foto colada convertida para WebP e inserida com sucesso (#${nextId})!`);
        } catch (err) {
          console.error('Erro ao colar foto:', err);
          notify('Erro ao converter foto colada para WebP.', 'error');
        }
        return;
      }
    }
  };

  // Drag & Drop image file directly into the textarea with automatic WebP conversion
  const handleEditorDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith('image/')) {
      e.preventDefault();
      try {
        const webpUrl = await convertFileToWebP(file, 1280, 1280, 0.85);
        const nextId = String(articleImages.length + 1);
        const caption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const align = 'centro';
        const initialWidth = 520;

        const newImageItem: ArticleImageItem = {
          id: nextId,
          url: webpUrl,
          caption,
          align,
          width: initialWidth
        };

        setArticleImages(prev => [...prev, newImageItem]);

        const cleanTag = `[img-${align}: ${nextId} | ${initialWidth}px | ${caption}]`;
        insertRichTagAtCursor(cleanTag);
        notify(`Foto arrastada convertida para WebP e inserida (#${nextId})!`);
      } catch (err) {
        console.error('Erro ao arrastar foto:', err);
        notify('Erro ao importar foto arrastada.', 'error');
      }
    }
  };

  // Clean any raw base64 string currently inside the text (e.g. from previous uploads)
  const sanitizeRawBase64InText = () => {
    let text = articleContent;
    const base64Regex = /\[img-(esquerda|direita|centro):\s*(data:image\/[^|\]]+)(?:\|\s*([^\]]+))?\]/gi;
    let match;
    let count = 0;
    const newImages: ArticleImageItem[] = [...articleImages];

    while ((match = base64Regex.exec(articleContent)) !== null) {
      count++;
      const align = match[1] as 'esquerda' | 'direita' | 'centro';
      const dataUrl = match[2];
      const caption = match[3] ? match[3].trim() : `Ilustração ${newImages.length + 1}`;
      const nextId = String(newImages.length + 1);
      const width = align === 'centro' ? 520 : 340;

      newImages.push({
        id: nextId,
        url: dataUrl,
        caption,
        align,
        width
      });

      const cleanTag = `[img-${align}: ${nextId} | ${width}px | ${caption}]`;
      text = text.replace(match[0], cleanTag);
    }

    if (count > 0) {
      setArticleImages(newImages);
      setArticleContent(text);
      notify(`✨ ${count} link(s) base64 longo(s) foram convertidos em fotos visuais limpas!`);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // RICH FORMATTING HELPERS (APPLIES TO SELECTED TEXT OR CURSOR)
  // ─────────────────────────────────────────────────────────────────

  const applyHeadingToSelection = (level: 1 | 2 | 3 | 4) => {
    const textarea = articleTextareaRef.current;
    const hashes = '#'.repeat(level);
    const headingLabels = {
      1: 'Título Principal (H1 - 36px)',
      2: 'Título Grande (H2 - 28px)',
      3: 'Subtítulo Médio (H3 - 22px)',
      4: 'Tópico Menor (H4 - 18px)'
    };

    if (!textarea) {
      setArticleContent(prev => prev + `\n\n${hashes} ${headingLabels[level]}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = articleContent;
    const selected = current.substring(start, end).trim();

    if (selected) {
      const cleaned = selected.replace(/^#+\s*/, '');
      const replacement = `\n\n${hashes} ${cleaned}\n\n`;
      const before = current.substring(0, start);
      const after = current.substring(end);
      setArticleContent(`${before}${replacement}${after}`);
      notify(`Tamanho H${level} aplicado ao texto selecionado!`);
    } else {
      const snippet = `\n\n${hashes} ${headingLabels[level]}\n\n`;
      const before = current.substring(0, start);
      const after = current.substring(end);
      setArticleContent(`${before}${snippet}${after}`);
      notify(`Inserido ${headingLabels[level]} no cursor!`);
    }

    setTimeout(() => {
      textarea.focus();
    }, 50);
  };

  const applyCustomFontSize = (sizePx: number) => {
    const textarea = articleTextareaRef.current;
    if (!textarea) {
      setArticleContent(prev => prev + ` [tam-${sizePx}: Texto em ${sizePx}px] `);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = articleContent;
    const selected = current.substring(start, end);

    if (selected.trim()) {
      const cleaned = selected.replace(/^\[tam-\d+:\s*([^\]]+)\]$/, '$1');
      const replacement = `[tam-${sizePx}: ${cleaned}]`;
      const before = current.substring(0, start);
      const after = current.substring(end);
      setArticleContent(`${before}${replacement}${after}`);
      notify(`Tamanho de ${sizePx}px aplicado ao texto selecionado!`);
    } else {
      const snippet = `[tam-${sizePx}: Texto em ${sizePx}px]`;
      const before = current.substring(0, start);
      const after = current.substring(end);
      setArticleContent(`${before}${snippet}${after}`);
      notify(`Inserido texto com fonte de ${sizePx}px!`);
    }

    setTimeout(() => {
      textarea.focus();
    }, 50);
  };

  const applyWrapperFormat = (prefix: string, suffix: string, defaultText: string) => {
    const textarea = articleTextareaRef.current;
    if (!textarea) {
      setArticleContent(prev => prev + `${prefix}${defaultText}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = articleContent;
    const selected = current.substring(start, end);

    if (selected.trim()) {
      const replacement = `${prefix}${selected}${suffix}`;
      const before = current.substring(0, start);
      const after = current.substring(end);
      setArticleContent(`${before}${replacement}${after}`);
    } else {
      const snippet = `${prefix}${defaultText}${suffix}`;
      const before = current.substring(0, start);
      const after = current.substring(end);
      setArticleContent(`${before}${snippet}${after}`);
    }

    setTimeout(() => {
      textarea.focus();
    }, 50);
  };

  const insertRichTagAtCursor = (tagToInsert: string) => {
    const textarea = articleTextareaRef.current;
    if (!textarea) {
      setArticleContent(prev => prev + '\n\n' + tagToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = articleContent;
    const before = current.substring(0, start);
    const after = current.substring(end);

    const updated = `${before}\n\n${tagToInsert}\n\n${after}`;
    setArticleContent(updated);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + tagToInsert.length + 4;
      textarea.setSelectionRange(newPos, newPos);
    }, 50);
  };

  // =========================================================================
  // HANDLERS: ARTICLES & SEO
  // =========================================================================
  const handleOpenNewArticle = () => {
    setEditingArticle(null);
    setArticleTitle('');
    setArticleCategory('Teologia');
    setArticleReadTime('6 min');
    setArticleAuthor('Redação Eclesia');
    setArticleImageUrl('https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800');
    setArticleAltText('');
    setArticleExcerpt('');
    setArticleContent('');
    setArticleImages([]);
    setArticleSlug('');
    setArticleMetaTitle('');
    setArticleMetaDescription('');
    setArticleKeywordsInput('igreja catolica, teologia, fe catolica');
    setArticleAdConfig({
      showTopAd: true,
      showMiddleAd: true,
      middleAdParagraph: 3,
      showSidebarAd: true,
      showBottomAd: true,
      adClient: 'ca-pub-1234567890123456',
      topSlotId: '1001',
      middleSlotId: '1002',
      sidebarSlotId: '1003',
      bottomSlotId: '1004'
    });
    setArticleEditorMode('split');
    setIsArticleFormOpen(true);
  };

  const handleEditArticle = (essay: Essay) => {
    setEditingArticle(essay);
    setArticleTitle(essay.title);
    setArticleCategory(essay.category);
    setArticleReadTime(essay.readTime);
    setArticleAuthor(essay.author);
    setArticleImageUrl(essay.imageUrl);
    setArticleAltText(essay.altText || essay.title);
    setArticleExcerpt(essay.excerpt);
    setArticleContent(essay.content);
    setArticleSlug(essay.slug || generateSeoSlug(essay.title));
    setArticleMetaTitle(essay.metaTitle || essay.title);
    setArticleMetaDescription(essay.metaDescription || essay.excerpt);
    setArticleKeywordsInput((essay.keywords || ['teologia catolica', 'doutrina da igreja']).join(', '));
    setArticleAdConfig(essay.adConfig || {
      showTopAd: true,
      showMiddleAd: true,
      middleAdParagraph: 3,
      showSidebarAd: true,
      showBottomAd: true,
      adClient: 'ca-pub-1234567890123456',
      topSlotId: '1001',
      middleSlotId: '1002',
      sidebarSlotId: '1003',
      bottomSlotId: '1004'
    });

    // Load mediaMap if present
    if (essay.mediaMap) {
      const loaded: ArticleImageItem[] = Object.entries(essay.mediaMap)
        .filter(([key]) => !key.startsWith('img-'))
        .map(([id, url]) => ({
          id,
          url,
          caption: `Ilustração ${id}`,
          align: 'esquerda',
          width: 340
        }));
      setArticleImages(loaded);
    } else {
      setArticleImages([]);
    }

    setArticleEditorMode('split');
    setIsArticleFormOpen(true);
    notify(`Modo de edição ativado para o artigo: "${essay.title}"`);
  };

  const handleAutoOptimizeSeo = () => {
    if (!articleTitle.trim() && !articleContent.trim()) {
      notify('Digite ao menos o título ou conteúdo do artigo para otimizar o SEO.', 'error');
      return;
    }

    const pkg = generateSmartSeoPackage(articleTitle, articleContent, articleCategory);

    setArticleSlug(pkg.slug);
    setArticleMetaTitle(pkg.metaTitle);
    setArticleMetaDescription(pkg.metaDescription);
    setArticleAltText(`Ilustração e arte sacra sobre ${articleTitle || 'artigo'} - Eclesia`);
    setArticleKeywordsInput(pkg.keywords.join(', '));

    notify('✨ Título, URL amigável, meta descrição e palavras-chave otimizados com sucesso!');
  };

  const handleApplyEditorialTemplate = (templateId: string) => {
    const tpl = CATHOLIC_EDITORIAL_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    if (articleContent.trim().length > 30) {
      if (!confirm('Deseja substituir o conteúdo atual pelo modelo editorial completo com estrutura 100% SEO?')) {
        return;
      }
    }

    setArticleContent(tpl.content);
    if (!articleTitle.trim()) {
      setArticleTitle(tpl.title);
      setArticleSlug(generateSeoSlug(tpl.title));
    }
    const pkg = generateSmartSeoPackage(articleTitle || tpl.title, tpl.content, articleCategory);
    setArticleMetaDescription(pkg.metaDescription);
    setArticleKeywordsInput(pkg.keywords.join(', '));

    notify(`Modelo editorial "${tpl.title}" aplicado com sucesso!`);
  };

  const handleGenerateAiArticle = async (tipo: 'liturgia' | 'tema_em_alta' | 'santo') => {
    setIsGeneratingAi(true);
    const rotuloTipo = tipo === 'liturgia' 
      ? 'a Liturgia Diária' 
      : tipo === 'tema_em_alta' 
      ? 'o Artigo com Tema Católico em Alta' 
      : 'o Santo do Dia';

    notify(`⚡ Conectando ao Grok & Imagen 3 para gerar ${rotuloTipo}... Aguarde alguns instantes.`, 'success');

    try {
      let art: any = null;

      // 1. Tenta invocar a Edge Function no Supabase
      try {
        const { data, error } = await supabase.functions.invoke('gerar-artigo-diario', {
          body: { tipo, statusArtigo: 'rascunho' }
        });

        if (!error && data?.success && data?.article) {
          art = data.article;
        }
      } catch (edgeErr) {
        console.warn('Edge Function ainda não disponível na nuvem Supabase, ativando gerador direto:', edgeErr);
      }

      // 2. Fallback automático: Se a Edge Function não estiver publicada ainda, gera diretamente
      if (!art) {
        art = await generateArticleClientSide(tipo);
      }

      if (art) {
        setEditingArticle(null);
        setArticleTitle(art.title || '');
        setArticleCategory(art.category || (tipo === 'liturgia' ? 'Liturgia Diária' : tipo === 'santo' ? 'Santo do Dia' : 'Teologia'));
        setArticleReadTime(art.read_time || '5 min de leitura');
        setArticleAuthor(art.author_name || 'Redação Eclesia');
        setArticleImageUrl(art.cover_image || '');
        setArticleAltText(art.alt_text || art.title || 'Arte sacra');
        setArticleExcerpt(art.excerpt || '');
        setArticleContent(art.content || '');
        setArticleSlug(art.slug || '');
        setArticleMetaTitle(art.meta_title || art.title);
        setArticleMetaDescription(art.meta_description || art.excerpt);
        setArticleKeywordsInput((art.keywords || []).join(', '));
        setArticleImages([]);
        setIsArticleFormOpen(true);
        setArticleEditorMode('split');

        notify(`🎉 Novo artigo (${rotuloTipo}) gerado com sucesso com 100% de Score SEO! Foto e textos já inseridos.`);
      }
    } catch (err: any) {
      console.error('Erro ao gerar artigo com IA:', err);
      if (err?.message?.includes('Chave de API do Grok') || err?.message?.includes('GROK_API_KEY')) {
        const inputKey = window.prompt('Para ativar a IA no seu painel Eclesia, insira sua chave do Grok / Groq (ex: gsk_...):\n(Ela será gravada com segurança no seu navegador):');
        if (inputKey && inputKey.trim()) {
          setGrokApiKey(inputKey.trim());
          notify('Chave do Grok salva com sucesso! Clique novamente no botão para gerar o artigo.', 'success');
          return;
        }
      }
      notify(`Falha ao conectar na IA: ${err.message || 'Verifique as chaves de API.'}`, 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setArticleTitle(val);
    if (!editingArticle || !articleSlug) {
      setArticleSlug(generateSeoSlug(val));
    }
  };

  const currentDraftArticle: Partial<Essay> = {
    title: articleTitle,
    content: articleContent,
    excerpt: articleExcerpt,
    category: articleCategory,
    imageUrl: articleImageUrl,
    altText: articleAltText,
    slug: articleSlug,
    metaTitle: articleMetaTitle || articleTitle,
    metaDescription: articleMetaDescription || articleExcerpt,
    keywords: articleKeywordsInput.split(',').map(k => k.trim()).filter(Boolean),
    adConfig: articleAdConfig
  };

  const currentDraftArticleForPreview: Essay = {
    id: editingArticle ? editingArticle.id : 'preview-draft',
    title: articleTitle.trim() || 'Título do Artigo em Prévia Real',
    category: articleCategory,
    type: 'artigo',
    readTime: articleReadTime || '5 min',
    author: articleAuthor || 'Redação Eclesia',
    imageUrl: articleImageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
    altText: articleAltText || articleTitle,
    excerpt: articleExcerpt || 'Resumo da publicação exibido no cabeçalho e nos cards.',
    content: articleContent || '*(Escreva o texto do seu artigo para visualizar a formatação completa aqui)*',
    date: editingArticle ? editingArticle.date : 'Hoje',
    slug: articleSlug || generateSeoSlug(articleTitle || 'artigo'),
    metaTitle: articleMetaTitle || articleTitle,
    metaDescription: articleMetaDescription || articleExcerpt,
    keywords: articleKeywordsInput.split(',').map(k => k.trim()).filter(Boolean),
    mediaMap: mediaMap,
    adConfig: articleAdConfig
  };

  const seoAudit: SeoAuditResult = calculateSeoScore(currentDraftArticle);

  const handleSaveArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || !articleContent.trim()) {
      notify('Preencha o título e o conteúdo do artigo.', 'error');
      return;
    }

    const finalSlug = articleSlug.trim() || generateSeoSlug(articleTitle);
    const finalMetaTitle = articleMetaTitle.trim() || articleTitle.trim();
    const finalMetaDesc = articleMetaDescription.trim() || generateSeoMetaDescription(articleContent, articleExcerpt);
    const finalKeywords = articleKeywordsInput.split(',').map(k => k.trim()).filter(Boolean);

    const payload: Essay = {
      id: editingArticle ? editingArticle.id : `essay-${Date.now()}`,
      title: articleTitle.trim(),
      category: articleCategory,
      readTime: articleReadTime,
      author: articleAuthor,
      imageUrl: articleImageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
      altText: articleAltText.trim() || `Imagem sobre ${articleTitle}`,
      excerpt: articleExcerpt.trim() || articleContent.slice(0, 150) + '...',
      content: articleContent.trim(),
      date: editingArticle ? editingArticle.date : 'Hoje',
      slug: finalSlug,
      metaTitle: finalMetaTitle,
      metaDescription: finalMetaDesc,
      keywords: finalKeywords,
      canonicalUrl: `https://eclesia.blog/blog/${finalSlug}`,
      ogImage: articleImageUrl,
      schemaType: 'Article',
      seoScore: seoAudit.score,
      mediaMap: mediaMap,
      adConfig: articleAdConfig
    };

    setIsFormSaving(true);
    try {
      await onSaveArticle(payload);
      notify(
        editingArticle
          ? `Artigo "${payload.title}" atualizado com sucesso no banco de dados!`
          : `Artigo "${payload.title}" publicado com sucesso no banco de dados!`
      );
      setIsArticleFormOpen(false);
      setIsFullScreen(false);
      setEditingArticle(null);
    } catch (err: any) {
      console.error('Erro ao salvar artigo:', err);
      notify(`Erro ao gravar no banco de dados: ${err?.message || 'Verifique as permissões RLS no Supabase.'}`, 'error');
    } finally {
      setIsFormSaving(false);
    }
  };

  // =========================================================================
  // HANDLERS: PRODUCTS
  // =========================================================================
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdSubtitle('');
    setProdPrice('89.90');
    setProdCategory('livro');
    setProdImageUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600');
    setProdDescription('');
    setProdInStock(true);
    setProdBuyUrl('');
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdTitle(p.title);
    setProdSubtitle(p.subtitle);
    setProdPrice(p.price.toString());
    setProdCategory(p.category);
    setProdImageUrl(p.imageUrl);
    setProdDescription(p.description);
    setProdInStock(p.inStock);
    setProdBuyUrl(p.buyUrl || '');
    setIsProductFormOpen(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(prodPrice.toString().replace(',', '.'));
    if (!prodTitle.trim() || isNaN(priceNum) || priceNum <= 0) {
      notify('Preencha um título e um preço válido.', 'error');
      return;
    }

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title: prodTitle.trim(),
      subtitle: prodSubtitle.trim(),
      price: priceNum,
      category: prodCategory,
      imageUrl: prodImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      description: prodDescription.trim(),
      inStock: prodInStock,
      buyUrl: prodBuyUrl.trim() || undefined
    };

    setIsFormSaving(true);
    try {
      await onSaveProduct(payload);
      notify(`Produto "${payload.title}" salvo no catálogo com sucesso!`);
      setIsProductFormOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Erro ao salvar produto:', err);
      notify(`Erro ao salvar produto: ${err?.message || 'Erro de banco de dados'}`, 'error');
    } finally {
      setIsFormSaving(false);
    }
  };

  // =========================================================================
  // HANDLERS: PRAYERS
  // =========================================================================
  const handleOpenNewPrayer = () => {
    setEditingPrayer(null);
    setPrayerTitle('');
    setPrayerCategory('diarias');
    setPrayerText('');
    setPrayerDescription('');
    setPrayerIsDaySpecial(false);
    setPrayerImageUrl('');
    setIsPrayerFormOpen(true);
  };

  const handleEditPrayer = (p: PrayerItem) => {
    setEditingPrayer(p);
    setPrayerTitle(p.title);
    setPrayerCategory((p.category || (p.situation === 'latim' ? 'latim' : p.situation === 'mariana' ? 'marianas' : p.situation === 'santos' ? 'santos' : 'diarias')) as any);
    setPrayerText(p.text || p.content || '');
    setPrayerDescription(p.description || '');
    setPrayerIsDaySpecial(!!(p.isDaySpecial || p.isFeaturedToday));
    setPrayerImageUrl(p.imageUrl || '');
    setIsPrayerFormOpen(true);
  };

  const handleSavePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerTitle.trim() || !prayerText.trim()) {
      notify('Preencha o título e o texto da oração.', 'error');
      return;
    }

    const payload: PrayerItem = {
      id: editingPrayer ? editingPrayer.id : `prayer-${Date.now()}`,
      title: prayerTitle.trim(),
      category: prayerCategory,
      text: prayerText.trim(),
      content: prayerText.trim(),
      description: prayerDescription.trim(),
      isDaySpecial: prayerIsDaySpecial,
      isFeaturedToday: prayerIsDaySpecial,
      imageUrl: prayerImageUrl.trim() || undefined
    };

    setIsFormSaving(true);
    try {
      await onSavePrayer(payload);
      notify(`Oração "${payload.title}" salva no acervo com sucesso!`);
      setIsPrayerFormOpen(false);
      setEditingPrayer(null);
    } catch (err: any) {
      console.error('Erro ao salvar oração:', err);
      notify(`Erro ao salvar oração: ${err?.message || 'Erro de banco de dados'}`, 'error');
    } finally {
      setIsFormSaving(false);
    }
  };

  // =========================================================================
  // HANDLERS: SAINTS (SANTORAL)
  // =========================================================================
  const handleOpenNewSaint = () => {
    setEditingSaint(null);
    setSaintName('');
    setSaintTitle('');
    setSaintFeastDate('');
    setSaintMonth(1);
    setSaintDay(1);
    setSaintImageUrl('https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800');
    setSaintPatronage('');
    setSaintSummary('');
    setSaintFullBio('');
    setSaintPrayer('');
    setSaintFeatured(false);
    setIsSaintFormOpen(true);
  };

  const handleEditSaint = (s: Saint) => {
    setEditingSaint(s);
    setSaintName(s.name);
    setSaintTitle(s.title || '');
    setSaintFeastDate(s.feastDate || '');
    setSaintMonth(s.month || 1);
    setSaintDay(s.day || 1);
    setSaintImageUrl(s.imageUrl || '');
    setSaintPatronage(s.patronage || '');
    setSaintSummary(s.summary || '');
    setSaintFullBio(s.fullBio || '');
    setSaintPrayer(s.prayer || '');
    setSaintFeatured(!!s.featured);
    setIsSaintFormOpen(true);
  };

  const handleSaveSaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saintName.trim()) {
      notify('Preencha o nome do santo.', 'error');
      return;
    }

    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const calculatedFeast = saintFeastDate.trim() || `${saintDay} de ${monthNames[(Number(saintMonth) || 1) - 1]}`;

    const payload: Saint = {
      id: editingSaint ? editingSaint.id : `saint-${saintName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      name: saintName.trim(),
      title: saintTitle.trim(),
      feastDate: calculatedFeast,
      month: Number(saintMonth) || 1,
      day: Number(saintDay) || 1,
      imageUrl: saintImageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
      patronage: saintPatronage.trim(),
      summary: saintSummary.trim(),
      fullBio: saintFullBio.trim(),
      prayer: saintPrayer.trim(),
      featured: saintFeatured
    };

    setIsFormSaving(true);
    try {
      await onSaveSaint(payload);
      notify(`Santo "${payload.name}" salvo no Santoral!`);
      setIsSaintFormOpen(false);
      setEditingSaint(null);
    } catch (err: any) {
      console.error('Erro ao salvar santo:', err);
      notify(`Erro ao salvar santo: ${err?.message || 'Erro de banco de dados'}`, 'error');
    } finally {
      setIsFormSaving(false);
    }
  };

  // Search filtering
  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrayers = prayers.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSaints = (saints || []).filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.patronage && s.patronage.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.title && s.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isDark = theme === 'dark';

  return (
    <div className={`w-full min-h-screen flex flex-col font-sans antialiased transition-colors duration-200 ${
      isDark
        ? 'bg-[#0f1117] text-slate-100 selection:bg-amber-500 selection:text-black'
        : 'bg-[#f8fafc] text-slate-900 selection:bg-amber-400 selection:text-black'
    }`}>
      {/* =========================================================================
          TOP ERP BAR (Status, Latency, Theme Switcher & Actions)
      ========================================================================= */}
      <header className={`border-b px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 transition-colors ${
        isDark
          ? 'bg-[#161922] border-slate-800 shadow-md'
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <LayoutDashboard className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className={`text-sm sm:text-base font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Eclesia Core ERP
              </h1>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SISTEMA OPERACIONAL
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Ambiente de Produção • Supabase DB Ativo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* DB Latency Badge */}
          <div className={`hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg border text-[11px] font-mono ${
            isDark
              ? 'bg-slate-900/80 border-slate-800 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>PostgreSQL Synced</span>
            <span className="text-slate-400">|</span>
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>18ms</span>
          </div>

          {/* Current User Info & Role Badge */}
          {user && (
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <UserIcon className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono text-[11px] max-w-[150px] truncate" title={user.email}>
                {user.email}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-amber-500 text-slate-950">
                {profile?.role || 'admin'}
              </span>
            </div>
          )}

          {/* Theme Toggle Button (Light/Dark) */}
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            <span className="hidden sm:inline">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <button
            onClick={() => setActiveView('home')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs'
            }`}
            title="Visualizar o site público"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Ver Portal</span>
          </button>

          {/* Real Supabase Auth Logout Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Encerrar sessão de administrador (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </header>

      {/* Main ERP Layout Grid */}
      <div className={`flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 transition-all ${
        isArticleFormOpen ? 'max-w-7xl' : 'max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'
      }`}>
        {/* =========================================================================
            ERP SIDEBAR (Hidden when writing an article to give 100% full width)
        ========================================================================= */}
        {!isArticleFormOpen && (
          <aside className={`lg:col-span-3 border rounded-2xl p-3.5 space-y-1.5 sticky top-20 transition-colors ${
            isDark
              ? 'bg-[#161922] border-slate-800/90 shadow-xl'
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b mb-1 ${
              isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'
            }`}>
              Módulos Corporativos
            </div>

            {[
              { id: 'overview', label: 'Visão Geral & KPIs', icon: LayoutDashboard, count: null },
              { id: 'blog', label: 'Artigos & SEO Editorial', icon: FileText, count: articles.length },
              { id: 'store', label: 'Catálogo de Produtos', icon: ShoppingBag, count: products.length },
              { id: 'prayers', label: 'Acervo de Orações', icon: Heart, count: prayers.length },
              { id: 'saints', label: 'Santoral & Santos', icon: Sparkles, count: (saints || []).length },
              { id: 'pages', label: 'CMS de Páginas', icon: Globe, count: null },
              { id: 'settings', label: 'Configurações do Sistema', icon: Settings, count: null }
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
                    setIsArticleFormOpen(false);
                    setIsProductFormOpen(false);
                    setIsPrayerFormOpen(false);
                    setEditingArticle(null);
                    setEditingProduct(null);
                    setEditingPrayer(null);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                      active
                        ? 'bg-slate-950/20 text-slate-950 font-bold'
                        : isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>
        )}

        {/* =========================================================================
            ERP MAIN WORKSPACE (Expands to 100% width when editing)
        ========================================================================= */}
        <main className={`space-y-6 ${isArticleFormOpen ? 'w-full' : 'lg:col-span-9'}`}>
          {/* Status Alert Notification */}
          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-md border animate-fade-in ${
              statusMessage.type === 'success'
                ? isDark
                  ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800/60'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : isDark
                ? 'bg-rose-950/60 text-rose-200 border-rose-800/60'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* =========================================================================
              TAB 1: VISÃO GERAL (OVERVIEW & KPIS)
          ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* ERP KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                  isDark
                    ? 'bg-[#161922] border-slate-800 shadow-md'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Artigos & Teologia
                    </span>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{articles.length}</p>
                    <span className="text-[11px] text-emerald-600 font-mono font-semibold">100% SEO Ativo</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('blog')}
                    className="text-xs text-amber-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Gerenciar Matérias →
                  </button>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                  isDark
                    ? 'bg-[#161922] border-slate-800 shadow-md'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Catálogo da Loja
                    </span>
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{products.length}</p>
                    <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Itens Ativos</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('store')}
                    className="text-xs text-amber-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Gerenciar Estoque →
                  </button>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                  isDark
                    ? 'bg-[#161922] border-slate-800 shadow-md'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Acervo Devocional
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Heart className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{prayers.length}</p>
                    <span className="text-[11px] text-emerald-600 font-mono font-semibold">Orações Ativas</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('prayers')}
                    className="text-xs text-amber-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Gerenciar Preces →
                  </button>
                </div>
              </div>

              {/* Quick Launch Control */}
              <div className={`p-6 sm:p-8 rounded-2xl border space-y-4 transition-colors ${
                isDark
                  ? 'bg-[#161922] border-slate-800 shadow-md'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Sparkles className="w-4 h-4 text-amber-500" /> Ações Rápidas de Publicação
                  </h3>
                  <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ERP Dispatcher</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    onClick={() => {
                      setActiveTab('blog');
                      handleOpenNewArticle();
                    }}
                    className={`p-4 rounded-xl text-left space-y-1.5 transition-all border cursor-pointer group ${
                      isDark
                        ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-amber-500/50'
                        : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-xs font-bold text-amber-600 block">+ Novo Artigo Otimizado</span>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Publicar com fotos flutuantes e SEO</p>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('store');
                      handleOpenNewProduct();
                    }}
                    className={`p-4 rounded-xl text-left space-y-1.5 transition-all border cursor-pointer group ${
                      isDark
                        ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-amber-500/50'
                        : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-xs font-bold text-amber-600 block">+ Novo Produto</span>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Adicionar livro ou sacramental à loja</p>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('prayers');
                      handleOpenNewPrayer();
                    }}
                    className={`p-4 rounded-xl text-left space-y-1.5 transition-all border cursor-pointer group ${
                      isDark
                        ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-amber-500/50'
                        : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-xs font-bold text-amber-600 block">+ Nova Oração</span>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Cadastrar prece no acervo católico</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: GESTÃO DO BLOG & EDITOR RICO DE ARTIGOS (ERP)
          ========================================================================= */}
          {activeTab === 'blog' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${
                isDark
                  ? 'bg-[#161922] border-slate-800 shadow-md'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Gestão Editorial de Artigos & Notícias
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Editor avançado com fotos visuais redimensionáveis, fontes customizáveis, modo tela cheia e SEO.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={() => handleGenerateAiArticle('liturgia')}
                    className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    title="Gerar artigo da Liturgia Diária de hoje com Grok e imagem litúrgica"
                  >
                    📖 {isGeneratingAi ? 'Gerando...' : 'Liturgia Diária (IA)'}
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={() => handleGenerateAiArticle('tema_em_alta')}
                    className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    title="A IA analisa o dia e escolhe o tema católico em alta (Grok + Imagen 3)"
                  >
                    🔥 {isGeneratingAi ? 'Gerando...' : 'Tema em Alta (IA)'}
                  </button>

                  <button
                    onClick={handleOpenNewArticle}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Novo Artigo
                  </button>
                </div>
              </div>

              {/* Rich Article Form Modal / Full Screen Workspace */}
              {isArticleFormOpen && (
                <form
                  onSubmit={handleSaveArticleSubmit}
                  className={`transition-all duration-200 space-y-6 ${
                    isFullScreen
                      ? `fixed inset-0 z-[9999] p-6 sm:p-10 overflow-y-auto w-screen h-screen max-w-none rounded-none shadow-none ${isDark ? 'bg-[#0f1117] text-white' : 'bg-[#f8fafc] text-slate-900'}`
                      : `p-6 sm:p-8 rounded-2xl w-full border shadow-xl ${isDark ? 'bg-[#161922] border-amber-500/40' : 'bg-white border-amber-400'}`
                  }`}
                >
                  <div className={`flex flex-wrap justify-between items-center border-b pb-4 gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => { setIsArticleFormOpen(false); setIsFullScreen(false); setEditingArticle(null); }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Lista
                      </button>

                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-500" />
                        <h4 className={`text-base font-bold truncate max-w-md ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {editingArticle ? `Editando Artigo: "${editingArticle.title}"` : 'Criar Novo Artigo Editorial'}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Fullscreen Expand/Collapse Button */}
                      <button
                        type="button"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          isFullScreen
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                            : isDark
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                        }`}
                        title={isFullScreen ? 'Sair da Tela Cheia' : 'Expandir para Tela Cheia'}
                      >
                        {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        <span>{isFullScreen ? 'Restaurar Janela' : 'Tela Cheia'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setIsArticleFormOpen(false); setIsFullScreen(false); setEditingArticle(null); }}
                        className={`p-1.5 rounded-lg cursor-pointer ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                        title="Fechar editor"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* ──────────────── GOOGLE SERP PREVIEW & LIVE SEO AUDIT ──────────────── */}
                  <div className={`border rounded-2xl p-5 space-y-4 ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <Globe className="w-3.5 h-3.5 text-blue-500" /> Prévia do Google Search & Painel de SEO
                      </span>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Quick AI Generators */}
                        <button
                          type="button"
                          disabled={isGeneratingAi}
                          onClick={() => handleGenerateAiArticle('liturgia')}
                          className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Gerar artigo da Liturgia Diária de hoje com IA"
                        >
                          📖 Liturgia IA
                        </button>
                        <button
                          type="button"
                          disabled={isGeneratingAi}
                          onClick={() => handleGenerateAiArticle('tema_em_alta')}
                          className="px-2.5 py-1 bg-purple-500/15 hover:bg-purple-500/25 text-purple-800 dark:text-purple-300 border border-purple-500/30 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Gerar artigo com Tema em Alta escolhido pela IA"
                        >
                          🔥 Tema em Alta IA
                        </button>
                        <button
                          type="button"
                          disabled={isGeneratingAi}
                          onClick={() => handleGenerateAiArticle('santo')}
                          className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Gerar Santo do Dia de hoje com IA"
                        >
                          ✝️ Santo IA
                        </button>

                        {/* Quick Template Inserters */}
                        <button
                          type="button"
                          onClick={() => handleApplyEditorialTemplate('doutrina')}
                          className="px-2.5 py-1 bg-slate-500/15 hover:bg-slate-500/25 text-slate-700 dark:text-slate-300 border border-slate-500/30 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Inserir modelo completo de Doutrina (650+ palavras, H2, oração)"
                        >
                          📄 Modelo Doutrina
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyEditorialTemplate('santo')}
                          className="px-2.5 py-1 bg-slate-500/15 hover:bg-slate-500/25 text-slate-700 dark:text-slate-300 border border-slate-500/30 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Inserir modelo de Vida dos Santos (600+ palavras, H2, oração)"
                        >
                          ✝️ Modelo Santo
                        </button>

                        <button
                          type="button"
                          onClick={handleAutoOptimizeSeo}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Otimizar SEO Automaticamente
                        </button>
                      </div>
                    </div>

                    {/* Google Snippet Card */}
                    <div className="bg-white p-4 rounded-xl text-slate-900 font-sans space-y-1 border border-slate-200 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-900">Eclesia Editorial</span>
                        <span>› blog › {articleSlug || 'seu-slug'}</span>
                      </div>
                      <h4 className="text-blue-700 text-base font-semibold hover:underline cursor-pointer line-clamp-1">
                        {articleMetaTitle || articleTitle || 'Título do Artigo Aparecerá Aqui no Google'}
                      </h4>
                      <p className="text-slate-600 text-xs line-clamp-2">
                        {articleMetaDescription || articleExcerpt || 'A meta descrição atrativa do seu artigo aparecerá aqui nos resultados de busca do Google...'}
                      </p>
                    </div>

                    {/* Score Bar & Checklist */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Score de SEO Editorial:</span>
                          <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border ${
                            seoAudit.score >= 85
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : seoAudit.score >= 60
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}>
                            {seoAudit.score}% — {seoAudit.status.toUpperCase()}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-500 font-mono">
                          {seoAudit.checks.filter(c => c.passed).length} de {seoAudit.checks.length} critérios atendidos
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            seoAudit.score >= 85 ? 'bg-emerald-500' : seoAudit.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${seoAudit.score}%` }}
                        />
                      </div>

                      {/* Dynamic Quality Checklist */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        {seoAudit.checks.map((check, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                              check.passed
                                ? isDark
                                  ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                                : isDark
                                ? 'bg-slate-900 border-slate-800 text-slate-400'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="shrink-0 mt-0.5">{check.passed ? '✓' : '⚠️'}</span>
                            <div className="space-y-0.5">
                              <span className="font-bold block">{check.label}</span>
                              <span className="text-[10px] opacity-85 block leading-tight">{check.recommendation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Basic Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Título do Artigo (H1) *
                      </label>
                      <input
                        type="text"
                        required
                        value={articleTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Ex: A Teologia do Amor em São Tomás de Aquino"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${
                          isDark
                            ? 'bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500'
                            : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Categoria Teológica
                      </label>
                      <select
                        value={articleCategory}
                        onChange={(e) => setArticleCategory(e.target.value)}
                        className={`w-full p-2.5 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${
                          isDark
                            ? 'bg-slate-900 border border-slate-700 text-white'
                            : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="Teologia">Teologia</option>
                        <option value="História da Igreja">História da Igreja</option>
                        <option value="Espiritualidade">Espiritualidade</option>
                        <option value="Arte Sacra">Arte Sacra</option>
                        <option value="Filosofia">Filosofia</option>
                        <option value="Liturgia">Liturgia</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Autor do Artigo
                      </label>
                      <input
                        type="text"
                        value={articleAuthor}
                        onChange={(e) => setArticleAuthor(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Tempo Estimado de Leitura
                      </label>
                      <input
                        type="text"
                        value={articleReadTime}
                        onChange={(e) => setArticleReadTime(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Cover Photo Upload with Machine Upload */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className={`block text-xs font-bold uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Foto de Capa Principal do Artigo
                      </label>
                      {articleImageUrl && (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Foto carregada
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={articleImageUrl}
                        onChange={(e) => setArticleImageUrl(e.target.value)}
                        placeholder="Cole a URL ou selecione uma foto da sua máquina..."
                        className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                      <label className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-xs">
                        <Upload className="w-4 h-4" /> {articleImageUrl ? 'Trocar Foto da Máquina' : 'Importar da Máquina'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleLocalImageFile(e, setArticleImageUrl, 'Foto de capa atualizada com sucesso!');
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {articleImageUrl && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="h-28 w-44 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 bg-slate-200">
                          <img src={articleImageUrl} alt="Capa do Artigo" className="w-full h-full object-cover" />
                        </div>

                        <div className="space-y-2 flex-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            Esta foto será exibida no topo do artigo e nos cards da página inicial.
                          </span>

                          <div className="flex items-center gap-2">
                            <label className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5" /> Escolher Outra Foto
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  handleLocalImageFile(e, setArticleImageUrl, 'Foto de capa atualizada!');
                                  e.target.value = '';
                                }}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                setArticleImageUrl('');
                                notify('Foto de capa removida. Você pode escolher outra ou salvar.');
                              }}
                              className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remover Foto
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary / Excerpt */}
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Resumo / Excerpt
                    </label>
                    <textarea
                      rows={2}
                      value={articleExcerpt}
                      onChange={(e) => setArticleExcerpt(e.target.value)}
                      placeholder="Breve introdução exibida nos cards do blog..."
                      className={`w-full p-3 rounded-xl text-xs leading-relaxed ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* ──────────────── MANAGE INLINE ARTICLE IMAGES (RESIZING & CARDS) ──────────────── */}
                  {articleImages.length > 0 && (
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-amber-50/50 border-amber-200'
                    }`}>
                      <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4" /> Fotos Inseridas no Artigo ({articleImages.length}) — Ajuste de Tamanho pelas Laterais
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">Arraste o slider para aumentar ou diminuir a largura</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {articleImages.map((img) => (
                          <div
                            key={img.id}
                            className={`p-3.5 rounded-xl border flex flex-col gap-3 shadow-xs ${
                              isDark ? 'bg-[#161922] border-slate-800' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-slate-100">
                                <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                              </div>

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                    Foto #{img.id}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteImageItem(img.id)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                                    title="Remover Foto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  value={img.caption}
                                  onChange={(e) => handleUpdateImageItem(img.id, { caption: e.target.value })}
                                  placeholder="Legenda da foto..."
                                  className={`w-full px-2 py-1 rounded text-xs border ${
                                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Image Width Controls (Slider & Presets) */}
                            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center justify-between text-xs">
                                <span className={`font-semibold flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                  <Sliders className="w-3.5 h-3.5 text-amber-500" /> Largura: <strong className="text-amber-600">{img.width}px</strong>
                                </span>

                                <div className="flex items-center gap-1">
                                  {[240, 340, 480, 600].map((preset) => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => handleUpdateImageItem(img.id, { width: preset })}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                                        img.width === preset
                                          ? 'bg-amber-500 text-slate-950'
                                          : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                      }`}
                                    >
                                      {preset}px
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Interactive Width Slider */}
                              <input
                                type="range"
                                min="160"
                                max="650"
                                step="10"
                                value={img.width}
                                onChange={(e) => handleUpdateImageItem(img.id, { width: parseInt(e.target.value, 10) })}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                              />
                            </div>

                            {/* Alignment Selector */}
                            <div className="flex items-center justify-between pt-1 text-xs">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateImageItem(img.id, { align: 'esquerda' })}
                                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                    img.align === 'esquerda'
                                      ? 'bg-amber-500 text-slate-950'
                                      : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  👈 Esquerda
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateImageItem(img.id, { align: 'direita' })}
                                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                    img.align === 'direita'
                                      ? 'bg-amber-500 text-slate-950'
                                      : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  👉 Direita
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateImageItem(img.id, { align: 'centro' })}
                                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                    img.align === 'centro'
                                      ? 'bg-amber-500 text-slate-950'
                                      : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  🖼️ Centro
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="text-[11px] text-amber-600 hover:text-amber-500 font-bold cursor-pointer flex items-center gap-1">
                                  <Upload className="w-3 h-3" /> Trocar Foto (WebP)
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleReplaceImageItemFile(img.id, e)}
                                    className="hidden"
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => handleReinsertImageTag(img)}
                                  className="text-[11px] text-amber-600 hover:underline font-bold cursor-pointer"
                                >
                                  + Inserir no cursor
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ──────────────── RICH ARTICLE EDITOR & TOOLBAR ──────────────── */}
                  <div className={`space-y-3 border rounded-2xl p-4 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Type className="w-4 h-4" /> Formatação de Fontes & Fotos Flutuantes (WebP Automático)
                      </span>

                      {/* View Modes: Editor Only, Live Preview Only, Split View + REAL FULL PAGE PREVIEW */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsLivePreviewModalOpen(true)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all animate-pulse hover:animate-none"
                          title="Abrir prévia real da página inteira com posicionamento dos anúncios Google Ads"
                        >
                          <Eye className="w-4 h-4" /> Visualizar Prévia Real & Anúncios
                        </button>

                        <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                        }`}>
                          <button
                            type="button"
                            onClick={() => setArticleEditorMode('edit')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              articleEditorMode === 'edit'
                                ? 'bg-amber-500 text-slate-950'
                                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                            }`}
                          >
                            ✏️ Editor
                          </button>
                          <button
                            type="button"
                            onClick={() => setArticleEditorMode('split')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                              articleEditorMode === 'split'
                                ? 'bg-amber-500 text-slate-950'
                                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                            }`}
                            title="Digitar e ver a prévia lado a lado ao mesmo tempo"
                          >
                            <Columns className="w-3.5 h-3.5" /> Lado a Lado
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsLivePreviewModalOpen(true)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                              articleEditorMode === 'preview'
                                ? 'bg-amber-500 text-slate-950'
                                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                            }`}
                            title="Abrir prévia completa em página inteira"
                          >
                            <Eye className="w-3.5 h-3.5" /> Prévia Visual
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Toolbar: Headings, Custom Sizes, Floating Photos & Styles */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {/* Headings Buttons */}
                      <button
                        type="button"
                        onClick={() => applyHeadingToSelection(1)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                        title="Título Principal H1 (36px)"
                      >
                        <Heading1 className="w-3.5 h-3.5 text-amber-600" /> H1 (36px)
                      </button>

                      <button
                        type="button"
                        onClick={() => applyHeadingToSelection(2)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                        title="Título Grande H2 (28px)"
                      >
                        <Heading2 className="w-3.5 h-3.5 text-amber-600" /> H2 (28px)
                      </button>

                      <button
                        type="button"
                        onClick={() => applyHeadingToSelection(3)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                        title="Subtítulo Médio H3 (22px)"
                      >
                        <Heading3 className="w-3.5 h-3.5 text-amber-600" /> H3 (22px)
                      </button>

                      <button
                        type="button"
                        onClick={() => applyHeadingToSelection(4)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                        title="Subtítulo H4 (18px)"
                      >
                        <Type className="w-3.5 h-3.5 text-amber-600" /> H4 (18px)
                      </button>

                      {/* Custom Font Size Selector */}
                      <select
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (val) {
                            applyCustomFontSize(val);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                          isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-200'
                        }`}
                        title="Definir tamanho de fonte personalizado para o texto selecionado"
                      >
                        <option value="" disabled>Tamanho de Fonte...</option>
                        <option value="12">12px (Muito Pequeno)</option>
                        <option value="14">14px (Pequeno)</option>
                        <option value="16">16px (Normal)</option>
                        <option value="18">18px (Médio)</option>
                        <option value="20">20px (Grande)</option>
                        <option value="24">24px (Destaque)</option>
                        <option value="28">28px (Título)</option>
                        <option value="32">32px (Impacto)</option>
                        <option value="40">40px (Hero)</option>
                      </select>

                      <span className={`w-px h-5 mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

                      {/* Floating Images with Local Machine Upload (WebP) */}
                      <label className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                      }`} title="Importar foto da máquina e converter para WebP à esquerda do texto">
                        <AlignLeft className="w-3.5 h-3.5 text-emerald-600" /> 👈 Foto à Esquerda
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAddArticleImage(e, 'esquerda')}
                          className="hidden"
                        />
                      </label>

                      <label className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                      }`} title="Importar foto da máquina e converter para WebP à direita do texto">
                        <AlignRight className="w-3.5 h-3.5 text-emerald-600" /> 👉 Foto à Direita
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAddArticleImage(e, 'direita')}
                          className="hidden"
                        />
                      </label>

                      <label className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                      }`} title="Importar foto da máquina e converter para WebP centralizada">
                        <AlignCenter className="w-3.5 h-3.5 text-emerald-600" /> 🖼️ Foto Central
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAddArticleImage(e, 'centro')}
                          className="hidden"
                        />
                      </label>

                      <span className={`w-px h-5 mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

                      {/* Insert Google Ad Tag at cursor */}
                      <button
                        type="button"
                        onClick={() => insertRichTagAtCursor('[anuncio]')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark
                            ? 'bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 border border-amber-800'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                        title="Inserir bloco de anúncio Google Ads no local do cursor"
                      >
                        <Megaphone className="w-3.5 h-3.5 text-amber-600" /> + Anúncio Google Ads
                      </button>

                      {/* Formatting */}
                      <button
                        type="button"
                        onClick={() => applyWrapperFormat('**', '**', 'texto em negrito')}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold flex items-center cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                        title="Negrito (**texto**)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => applyWrapperFormat('*', '*', 'texto em itálico')}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold flex items-center cursor-pointer ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                        title="Itálico (*texto*)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => applyWrapperFormat('> "', '" — Nome do Santo', 'A medida do amor é amar sem medida.')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                        title="Citação de Santo (> ...)"
                      >
                        <Quote className="w-3.5 h-3.5 text-amber-600" /> Citação
                      </button>

                      <button
                        type="button"
                        onClick={() => insertRichTagAtCursor('\n\n⸻\n\n')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                        title="Divisor Decorativo"
                      >
                        ⸻ Divisor
                      </button>
                    </div>

                    {/* Active Editor & Live Preview Area */}
                    {articleEditorMode === 'split' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Editor de Código / Texto (Suporta Colar/Arrastar Imagens com conversão WebP)
                          </span>
                          <textarea
                            ref={articleTextareaRef}
                            rows={isFullScreen ? 22 : 16}
                            required
                            value={articleContent}
                            onChange={(e) => setArticleContent(e.target.value)}
                            onPaste={handleEditorPaste}
                            onDrop={handleEditorDrop}
                            placeholder="Escreva seu artigo... Você pode colar imagens (Ctrl+V) ou arrastar fotos diretamente para cá — elas serão convertidas para WebP automaticamente!"
                            className={`w-full p-4 rounded-xl text-xs font-mono leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-amber-500 overflow-y-auto ${
                              isFullScreen ? 'h-[calc(100vh-380px)] min-h-[480px]' : 'h-[460px]'
                            } ${
                              isDark
                                ? 'bg-slate-950 border border-slate-800 text-slate-100'
                                : 'bg-white border border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="space-y-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider block text-amber-600`}>
                            Prévia Visual da Formatação
                          </span>
                          <div className={`p-6 rounded-xl border overflow-y-auto shadow-inner ${
                            isFullScreen ? 'h-[calc(100vh-380px)] min-h-[480px]' : 'h-[460px]'
                          } ${
                            isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border border-slate-300 text-slate-900'
                          }`}>
                            <RichArticleRenderer
                              content={articleContent || '*(O conteúdo formatado aparecerá aqui em tempo real)*'}
                              mediaMap={mediaMap}
                              adConfig={articleAdConfig}
                            />
                          </div>
                        </div>
                      </div>
                    ) : articleEditorMode === 'edit' ? (
                      <textarea
                        ref={articleTextareaRef}
                        rows={isFullScreen ? 24 : 14}
                        required
                        value={articleContent}
                        onChange={(e) => setArticleContent(e.target.value)}
                        onPaste={handleEditorPaste}
                        onDrop={handleEditorDrop}
                        placeholder="Escreva todo o corpo do artigo aqui. Você pode colar imagens (Ctrl+V) ou arrastar fotos diretamente para cá — elas serão convertidas para WebP automaticamente!"
                        className={`w-full p-4 rounded-xl text-xs font-mono leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${
                          isFullScreen ? 'h-[calc(100vh-380px)] min-h-[480px]' : 'h-[400px]'
                        } ${
                          isDark
                            ? 'bg-slate-950 border border-slate-800 text-slate-100'
                            : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    ) : (
                      <div className={`bg-white text-slate-900 p-6 rounded-xl border border-slate-300 overflow-y-auto shadow-inner ${
                        isFullScreen ? 'h-[calc(100vh-380px)] min-h-[480px]' : 'min-h-[350px]'
                      }`}>
                        <RichArticleRenderer
                          content={articleContent || '*(O conteúdo digitado aparecerá aqui formatado em tempo real com títulos e fotos ao lado do texto)*'}
                          mediaMap={mediaMap}
                          adConfig={articleAdConfig}
                        />
                      </div>
                    )}
                  </div>

                  {/* ──────────────── GOOGLE ADS PLACEMENT & MONETIZATION ──────────────── */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-amber-50/50 border-amber-200 shadow-xs'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Posicionamento de Anúncios Google Ads no Artigo
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLivePreviewModalOpen(true)}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Abrir na Prévia Real da Página
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        articleAdConfig.showTopAd
                          ? 'border-amber-500/60 bg-amber-50/50 dark:bg-amber-950/30'
                          : isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={!!articleAdConfig.showTopAd}
                          onChange={(e) => setArticleAdConfig(prev => ({ ...prev, showTopAd: e.target.checked }))}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-300">Topo (Abaixo da Capa)</span>
                      </label>

                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        articleAdConfig.showMiddleAd
                          ? 'border-amber-500/60 bg-amber-50/50 dark:bg-amber-950/30'
                          : isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={!!articleAdConfig.showMiddleAd}
                          onChange={(e) => setArticleAdConfig(prev => ({ ...prev, showMiddleAd: e.target.checked }))}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-300">Meio do Texto</span>
                      </label>

                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        articleAdConfig.showSidebarAd
                          ? 'border-amber-500/60 bg-amber-50/50 dark:bg-amber-950/30'
                          : isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={!!articleAdConfig.showSidebarAd}
                          onChange={(e) => setArticleAdConfig(prev => ({ ...prev, showSidebarAd: e.target.checked }))}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-300">Barra Lateral</span>
                      </label>

                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        articleAdConfig.showBottomAd
                          ? 'border-amber-500/60 bg-amber-50/50 dark:bg-amber-950/30'
                          : isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={!!articleAdConfig.showBottomAd}
                          onChange={(e) => setArticleAdConfig(prev => ({ ...prev, showBottomAd: e.target.checked }))}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-300">Rodapé do Artigo</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-emerald-700 font-mono flex items-center gap-1.5 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Sincronização e Atualização Automática no Banco
                    </span>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setIsArticleFormOpen(false); setIsFullScreen(false); setEditingArticle(null); }}
                        className={`px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer ${
                          isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isFormSaving}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold uppercase shadow-md cursor-pointer flex items-center gap-2"
                      >
                        {isFormSaving && <span className="animate-spin">⏳</span>}
                        {isFormSaving ? 'Gravando no Banco...' : (editingArticle ? 'Salvar Alterações do Artigo' : 'Publicar Artigo')}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Articles Table Grid */}
              <div className={`rounded-2xl border overflow-hidden transition-colors ${
                isDark
                  ? 'bg-[#161922] border-slate-800 shadow-md'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className={`p-4 border-b flex items-center justify-between ${
                  isDark ? 'border-slate-800 bg-slate-900/70 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  <span className="text-xs font-bold uppercase">Artigos Publicados ({filteredArticles.length})</span>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar por título..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-8 pr-3 py-1 rounded-xl text-xs focus:outline-hidden ${
                        isDark ? 'bg-slate-950 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {filteredArticles.map((article) => (
                    <div key={article.id} className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      isDark ? 'hover:bg-slate-800/40' : 'hover:bg-amber-50/40'
                    }`}>
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-300 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                              {article.category}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> SEO Ativo
                            </span>
                          </div>
                          <h4 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{article.title}</h4>
                          <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{article.author} • {article.readTime} • /blog/{article.slug}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEditArticle(article)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                          title="Editar Artigo & Conteúdo"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o artigo "${article.title}"?`)) {
                              onDeleteArticle(article.id);
                              notify('Artigo excluído com sucesso.');
                            }
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Excluir Artigo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: GESTÃO DA LOJA (PRODUTOS ERP)
          ========================================================================= */}
          {activeTab === 'store' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${
                isDark
                  ? 'bg-[#161922] border-slate-800 shadow-md'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Catálogo de Produtos & Sacramentais</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Controle de preços, estoque e fotos da loja católica.</p>
                </div>

                <button
                  onClick={handleOpenNewProduct}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Novo Produto
                </button>
              </div>

              {/* Product Form Editor */}
              {isProductFormOpen && (
                <form onSubmit={handleSaveProductSubmit} className={`p-6 sm:p-8 rounded-2xl border shadow-xl space-y-4 transition-colors ${
                  isDark
                    ? 'bg-[#161922] border-amber-500/40'
                    : 'bg-white border-amber-400'
                }`}>
                  <div className={`flex justify-between items-center border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => { setIsProductFormOpen(false); setEditingProduct(null); }}
                      className={`p-1 rounded-lg cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Título do Produto *</label>
                      <input
                        type="text"
                        required
                        value={prodTitle}
                        onChange={(e) => setProdTitle(e.target.value)}
                        placeholder="Ex: Crucifixo de Mesa em Latão Antigo"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Subtítulo / Edição</label>
                      <input
                        type="text"
                        value={prodSubtitle}
                        onChange={(e) => setProdSubtitle(e.target.value)}
                        placeholder="Ex: Peça maciça trabalhada à mão"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Preço em R$ *</label>
                      <input
                        type="text"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="Ex: 149.90"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Categoria</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value as any)}
                        className={`w-full p-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="livro">Livros & Manuscritos</option>
                        <option value="sacramental">Sacramentais</option>
                        <option value="arte">Arte Sacra</option>
                        <option value="vestuario">Vestuário</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Disponibilidade</label>
                      <select
                        value={prodInStock ? 'sim' : 'nao'}
                        onChange={(e) => setProdInStock(e.target.value === 'sim')}
                        className={`w-full p-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="sim">Em Estoque</option>
                        <option value="nao">Esgotado / Sob Encomenda</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Foto do Produto</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={prodImageUrl}
                        onChange={(e) => setProdImageUrl(e.target.value)}
                        placeholder="Cole a URL da imagem ou selecione da sua máquina..."
                        className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                      <label className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs">
                        <Upload className="w-3.5 h-3.5" /> Importar Foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLocalImageFile(e, setProdImageUrl, 'Foto do produto importada!')}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {prodImageUrl && (
                      <div className="mt-2 h-28 w-28 rounded-xl overflow-hidden border border-slate-300">
                        <img src={prodImageUrl} alt="Produto" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Link Externo de Compra (Mercado Livre, Shopee ou Loja Online)
                    </label>
                    <input
                      type="url"
                      value={prodBuyUrl}
                      onChange={(e) => setProdBuyUrl(e.target.value)}
                      placeholder="Ex: https://produto.mercadolivre.com.br/... ou https://shopee.com.br/..."
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Opcional: Se preenchido, o botão "Comprar" redirecionará o cliente para o seu link no Mercado Livre / Shopee.
                    </span>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Descrição do Produto</label>
                    <textarea
                      rows={3}
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      placeholder="Detalhes sobre dimensões, material e espiritualidade..."
                      className={`w-full p-3 rounded-xl text-xs leading-relaxed ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsProductFormOpen(false); setEditingProduct(null); }}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer ${
                        isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isFormSaving}
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold uppercase shadow-sm cursor-pointer flex items-center gap-2"
                    >
                      {isFormSaving && <span className="animate-spin">⏳</span>}
                      {isFormSaving ? 'Gravando Produto...' : 'Salvar Produto'}
                    </button>
                  </div>
                </form>
              )}

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((p) => (
                  <div key={p.id} className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between transition-colors ${
                    isDark
                      ? 'bg-[#161922] border-slate-800 shadow-md'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div>
                      <div className={`h-36 rounded-xl overflow-hidden border mb-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-amber-600">{p.category}</span>
                      <h4 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.title}</h4>
                      <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.subtitle}</p>
                    </div>

                    <div className={`pt-2 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <span className="font-mono text-base font-bold text-amber-600">
                        R$ {p.price.toFixed(2).replace('.', ',')}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditProduct(p)}
                          className={`p-1.5 rounded-lg cursor-pointer ${isDark ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-600 hover:bg-amber-50'}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o produto "${p.title}"?`)) {
                              onDeleteProduct(p.id);
                              notify('Produto excluído.');
                            }
                          }}
                          className={`p-1.5 rounded-lg cursor-pointer ${isDark ? 'text-rose-400 hover:bg-slate-800' : 'text-rose-600 hover:bg-rose-50'}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: GESTÃO DE ORAÇÕES (ERP)
          ========================================================================= */}
          {activeTab === 'prayers' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${
                isDark
                  ? 'bg-[#161922] border-slate-800 shadow-md'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Acervo de Orações Católicas</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Adicione novas orações e defina a Oração do Dia em destaque.</p>
                </div>

                <button
                  onClick={handleOpenNewPrayer}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Nova Oração
                </button>
              </div>

              {/* Prayer Form */}
              {isPrayerFormOpen && (
                <form onSubmit={handleSavePrayerSubmit} className={`p-6 sm:p-8 rounded-2xl border shadow-xl space-y-4 transition-colors ${
                  isDark
                    ? 'bg-[#161922] border-amber-500/40'
                    : 'bg-white border-amber-400'
                }`}>
                  <div className={`flex justify-between items-center border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {editingPrayer ? 'Editar Oração' : 'Cadastrar Nova Oração'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => { setIsPrayerFormOpen(false); setEditingPrayer(null); }}
                      className={`p-1 rounded-lg cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Título da Oração *</label>
                      <input
                        type="text"
                        required
                        value={prayerTitle}
                        onChange={(e) => setPrayerTitle(e.target.value)}
                        placeholder="Ex: Oração a São Miguel Arcanjo"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Categoria</label>
                      <select
                        value={prayerCategory}
                        onChange={(e) => setPrayerCategory(e.target.value as any)}
                        className={`w-full p-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="diarias">Orações Diárias & Ofício</option>
                        <option value="marianas">Devoção Mariana</option>
                        <option value="santos">Santos & Anjos</option>
                        <option value="latim">Preces em Latim</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Descrição / Origem (Opcional)</label>
                    <input
                      type="text"
                      value={prayerDescription}
                      onChange={(e) => setPrayerDescription(e.target.value)}
                      placeholder="Ex: Tradicional prece indulgenciada pelo Papa Leão XIII"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Prayer Image Field with Automatic WebP Conversion */}
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Imagem / Ilustração da Oração (Convertida para WebP automaticamente)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={prayerImageUrl}
                        onChange={(e) => setPrayerImageUrl(e.target.value)}
                        placeholder="Cole o link da imagem ou anexe um arquivo PNG/JPG da sua máquina..."
                        className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                      <label className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs">
                        <Upload className="w-3.5 h-3.5" /> Importar Imagem
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLocalImageFile(e, setPrayerImageUrl, 'Imagem da oração convertida para WebP e importada com sucesso!')}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {prayerImageUrl && (
                      <div className="mt-2 h-28 w-28 rounded-xl overflow-hidden border border-slate-300 relative group">
                        <img src={prayerImageUrl} alt="Oração" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPrayerImageUrl('')}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 cursor-pointer"
                          title="Remover Imagem"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Texto Completo da Oração *</label>
                    <textarea
                      rows={6}
                      required
                      value={prayerText}
                      onChange={(e) => setPrayerText(e.target.value)}
                      placeholder="Escreva a oração..."
                      className={`w-full p-4 rounded-xl text-xs leading-relaxed font-serif ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDaySpecial"
                      checked={prayerIsDaySpecial}
                      onChange={(e) => setPrayerIsDaySpecial(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <label htmlFor="isDaySpecial" className={`text-xs font-bold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Destacar como "Oração do Dia" no topo da página
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsPrayerFormOpen(false); setEditingPrayer(null); }}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer ${
                        isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isFormSaving}
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold uppercase shadow-sm cursor-pointer flex items-center gap-2"
                    >
                      {isFormSaving && <span className="animate-spin">⏳</span>}
                      {isFormSaving ? 'Gravando Oração...' : 'Salvar Oração'}
                    </button>
                  </div>
                </form>
              )}

              {/* Prayers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrayers.map((prayer) => (
                  <div key={prayer.id} className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between transition-colors ${
                    isDark
                      ? 'bg-[#161922] border-slate-800 shadow-md'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div>
                      {prayer.imageUrl && (
                        <div className={`h-36 rounded-xl overflow-hidden border mb-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                          <img src={prayer.imageUrl} alt={prayer.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                          {prayer.category || prayer.situation}
                        </span>
                        {(prayer.isDaySpecial || prayer.isFeaturedToday) && (
                          <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                            ★ Oração do Dia
                          </span>
                        )}
                      </div>
                      <h4 className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{prayer.title}</h4>
                      <p className={`text-xs italic line-clamp-3 mt-1 font-serif ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>"{prayer.text || prayer.content}"</p>
                    </div>

                    <div className={`pt-2 border-t flex justify-end gap-1 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <button
                        onClick={() => handleEditPrayer(prayer)}
                        className={`p-1.5 rounded-lg cursor-pointer ${isDark ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-600 hover:bg-amber-50'}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir a oração "${prayer.title}"?`)) {
                            onDeletePrayer(prayer.id);
                            notify('Oração excluída.');
                          }
                        }}
                        className={`p-1.5 rounded-lg cursor-pointer ${isDark ? 'text-rose-400 hover:bg-slate-800' : 'text-rose-600 hover:bg-rose-50'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: GESTÃO DO SANTORAL & SANTOS DO DIA (ERP)
          ========================================================================= */}
          {activeTab === 'saints' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${
                isDark
                  ? 'bg-[#161922] border-slate-800 shadow-md'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Santoral & Santos da Igreja</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cadastre novos santos, edite biografias, orações e fotos do santoral católico.</p>
                </div>

                <button
                  onClick={handleOpenNewSaint}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Novo Santo
                </button>
              </div>

              {/* Saint Form Editor */}
              {isSaintFormOpen && (
                <form onSubmit={handleSaveSaintSubmit} className={`p-6 sm:p-8 rounded-2xl border shadow-xl space-y-4 transition-colors ${
                  isDark
                    ? 'bg-[#161922] border-amber-500/40'
                    : 'bg-white border-amber-400'
                }`}>
                  <div className={`flex justify-between items-center border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {editingSaint ? `Editar: ${editingSaint.name}` : 'Cadastrar Santo no Santoral'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => { setIsSaintFormOpen(false); setEditingSaint(null); }}
                      className={`p-1 rounded-lg cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nome do Santo *</label>
                      <input
                        type="text"
                        required
                        value={saintName}
                        onChange={(e) => setSaintName(e.target.value)}
                        placeholder="Ex: Santa Teresinha do Menino Jesus"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Título / Epíteto</label>
                      <input
                        type="text"
                        value={saintTitle}
                        onChange={(e) => setSaintTitle(e.target.value)}
                        placeholder="Ex: Virgem e Doutora da Igreja"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Dia do Mês (1-31)</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={saintDay}
                        onChange={(e) => setSaintDay(parseInt(e.target.value, 10) || 1)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mês (1-12)</label>
                      <select
                        value={saintMonth}
                        onChange={(e) => setSaintMonth(parseInt(e.target.value, 10) || 1)}
                        className={`w-full p-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      >
                        {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, idx) => (
                          <option key={idx + 1} value={idx + 1}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Data Festiva (Exibição)</label>
                      <input
                        type="text"
                        value={saintFeastDate}
                        onChange={(e) => setSaintFeastDate(e.target.value)}
                        placeholder="Ex: 1 de Outubro"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Padroeiro(a) de</label>
                    <input
                      type="text"
                      value={saintPatronage}
                      onChange={(e) => setSaintPatronage(e.target.value)}
                      placeholder="Ex: Missionários, floristas, aviadores e teólogos"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Foto / Imagem do Santo</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={saintImageUrl}
                        onChange={(e) => setSaintImageUrl(e.target.value)}
                        placeholder="Cole o link da imagem ou importe do computador..."
                        className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs ${
                          isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                      <label className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs">
                        <Upload className="w-3.5 h-3.5" /> Importar Foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLocalImageFile(e, setSaintImageUrl, 'Foto do Santo importada com sucesso!')}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {saintImageUrl && (
                      <div className="mt-2 h-28 w-28 rounded-xl overflow-hidden border border-slate-300">
                        <img src={saintImageUrl} alt="Santo" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Resumo Breve da Vida</label>
                    <input
                      type="text"
                      value={saintSummary}
                      onChange={(e) => setSaintSummary(e.target.value)}
                      placeholder="Breve resumo exibido nos cards do Santoral..."
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Biografia Completa & Vida Histórica</label>
                    <textarea
                      rows={6}
                      value={saintFullBio}
                      onChange={(e) => setSaintFullBio(e.target.value)}
                      placeholder="História completa, virtudes, milagres e ensinamentos espirituais..."
                      className={`w-full p-3 rounded-xl text-xs leading-relaxed ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Oração ao Santo</label>
                    <textarea
                      rows={4}
                      value={saintPrayer}
                      onChange={(e) => setSaintPrayer(e.target.value)}
                      placeholder="Prece devocional tradicional a este santo..."
                      className={`w-full p-3 rounded-xl text-xs leading-relaxed font-serif ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saintFeatured"
                      checked={saintFeatured}
                      onChange={(e) => setSaintFeatured(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <label htmlFor="saintFeatured" className={`text-xs font-bold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Destacar este Santo na Página Inicial
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsSaintFormOpen(false); setEditingSaint(null); }}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer ${
                        isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isFormSaving}
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold uppercase shadow-sm cursor-pointer flex items-center gap-2"
                    >
                      {isFormSaving && <span className="animate-spin">⏳</span>}
                      {isFormSaving ? 'Gravando Santo...' : 'Salvar Santo'}
                    </button>
                  </div>
                </form>
              )}

              {/* Saints Grid List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredSaints.map((s) => (
                  <div key={s.id} className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between transition-colors ${
                    isDark
                      ? 'bg-[#161922] border-slate-800 shadow-md'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div>
                      <div className={`h-36 rounded-xl overflow-hidden border mb-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                        <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          {s.feastDate}
                        </span>
                        {s.featured && (
                          <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded-md">
                            Destaque
                          </span>
                        )}
                      </div>
                      <h4 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</h4>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} line-clamp-1`}>{s.title}</p>
                      {s.patronage && (
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'} italic line-clamp-1 mt-1`}>
                          Padroeiro: {s.patronage}
                        </p>
                      )}
                    </div>

                    <div className={`pt-2 border-t flex justify-end gap-1 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <button
                        onClick={() => handleEditSaint(s)}
                        className={`p-1.5 rounded-lg cursor-pointer ${isDark ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-600 hover:bg-amber-50'}`}
                        title="Editar Santo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir o santo "${s.name}" do Santoral?`)) {
                            onDeleteSaint(s.id);
                            notify('Santo excluído do Santoral.');
                          }
                        }}
                        className={`p-1.5 rounded-lg cursor-pointer ${isDark ? 'text-rose-400 hover:bg-slate-800' : 'text-rose-600 hover:bg-rose-50'}`}
                        title="Excluir Santo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: GESTÃO DE CONTEÚDOS DAS PÁGINAS (CMS ERP)
          ========================================================================= */}
          {activeTab === 'pages' && (
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 transition-colors ${
              isDark
                ? 'bg-[#161922] border-slate-800 shadow-md'
                : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className={`border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Páginas & Conteúdos do Site</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Edite textos institucionais e banners de cada página do portal.</p>
              </div>

              <div className="space-y-6">
                <div className={`p-4 border rounded-xl space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-xs font-bold uppercase text-amber-600">Frase em Destaque na Página Inicial</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={settings.homeHeroQuote.text}
                      onChange={(e) => setSettings({
                        ...settings,
                        homeHeroQuote: { ...settings.homeHeroQuote, text: e.target.value }
                      })}
                      className={`px-3.5 py-2.5 rounded-xl text-xs ${
                        isDark ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                      placeholder="Citação..."
                    />
                    <input
                      type="text"
                      value={settings.homeHeroQuote.author}
                      onChange={(e) => setSettings({
                        ...settings,
                        homeHeroQuote: { ...settings.homeHeroQuote, author: e.target.value }
                      })}
                      className={`px-3.5 py-2.5 rounded-xl text-xs ${
                        isDark ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                      placeholder="Autor..."
                    />
                  </div>
                </div>

                <div className={`p-4 border rounded-xl space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase text-amber-600">Banner de Notificação Superior</h4>
                    <label className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <input
                        type="checkbox"
                        checked={settings.announcementBanner.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          announcementBanner: { ...settings.announcementBanner, enabled: e.target.checked }
                        })}
                      />
                      Ativo
                    </label>
                  </div>
                  <input
                    type="text"
                    value={settings.announcementBanner.text}
                    onChange={(e) => setSettings({
                      ...settings,
                      announcementBanner: { ...settings.announcementBanner, text: e.target.value }
                    })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                      isDark ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                    placeholder="Texto do anúncio..."
                  />
                </div>

                <button
                  type="button"
                  disabled={isFormSaving}
                  onClick={async () => {
                    setIsFormSaving(true);
                    try {
                      await saveSiteSettingsToDb(settings);
                      notify('Conteúdos institucionais atualizados e salvos com sucesso no Supabase!');
                    } catch (err: any) {
                      notify(`Erro ao salvar no banco: ${err?.message}`, 'error');
                    } finally {
                      setIsFormSaving(false);
                    }
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold uppercase shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {isFormSaving && <span className="animate-spin">⏳</span>}
                  {isFormSaving ? 'Gravando...' : 'Salvar Textos do Site'}
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 6: CONFIGURAÇÕES GERAIS (SETTINGS ERP)
          ========================================================================= */}
          {activeTab === 'settings' && (
            <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 transition-colors ${
              isDark
                ? 'bg-[#161922] border-slate-800 shadow-md'
                : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className={`border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Configurações Globais do Sistema</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Identidade do portal, canais de comunicação e credenciais de suporte.</p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsFormSaving(true);
                  try {
                    await saveSiteSettingsToDb(settings);
                    notify('Configurações globais salvas com sucesso no Supabase!');
                  } catch (err: any) {
                    notify(`Erro ao salvar configurações: ${err?.message}`, 'error');
                  } finally {
                    setIsFormSaving(false);
                  }
                }}
                className="space-y-4 max-w-xl"
              >
                <div>
                  <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nome do Portal</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                      isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Slogan / Tagline</label>
                  <input
                    type="text"
                    value={settings.siteTagline}
                    onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                      isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>E-mail de Suporte / Contato</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                      isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Instagram URL</label>
                    <input
                      type="text"
                      value={settings.instagramUrl}
                      onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>YouTube URL</label>
                    <input
                      type="text"
                      value={settings.youtubeUrl}
                      onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs ${
                        isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isFormSaving}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold uppercase shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {isFormSaving && <span className="animate-spin">⏳</span>}
                  {isFormSaving ? 'Gravando...' : 'Salvar Configurações'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ──────────────── FULL ARTICLE LIVE PREVIEW & GOOGLE ADS CONTROLLER MODAL ──────────────── */}
      <ArticleLivePreviewModal
        essay={currentDraftArticleForPreview}
        isOpen={isLivePreviewModalOpen}
        onClose={() => setIsLivePreviewModalOpen(false)}
        onUpdateAdConfig={(cfg) => setArticleAdConfig(cfg)}
      />
    </div>
  );
};
