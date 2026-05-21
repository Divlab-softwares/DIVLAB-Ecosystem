import type { ToolDefinition } from '../types';
import { Base64Tool } from '../tools/dev/base64/Base64Tool';
import { CsvJsonTool } from '../tools/dev/csv-json/CsvJsonTool';
import { HashGeneratorTool } from '../tools/dev/hash-generator/HashGeneratorTool';
import { JsonFormatterTool } from '../tools/dev/json-formatter/JsonFormatterTool';
import { RegexTesterTool } from '../tools/dev/regex-tester/RegexTesterTool';
import { TimestampConverterTool } from '../tools/dev/timestamp-converter/TimestampConverterTool';
import { UrlCodecTool } from '../tools/dev/url-codec/UrlCodecTool';
import { UuidGeneratorTool } from '../tools/dev/uuid-generator/UuidGeneratorTool';
import { ColorPaletteTool } from '../tools/create/color-palette/ColorPaletteTool';
import { GradientGeneratorTool } from '../tools/create/gradient-generator/GradientGeneratorTool';
import { ImageResizeTool } from '../tools/create/image-resize/ImageResizeTool';
import { QrCodeTool } from '../tools/create/qr-code/QrCodeTool';
import { DiscountCalculatorTool } from '../tools/business/discount-calculator/DiscountCalculatorTool';
import { HourlyRateTool } from '../tools/business/hourly-rate/HourlyRateTool';
import { MarginCalculatorTool } from '../tools/business/margin-calculator/MarginCalculatorTool';
import { SignatureGeneratorTool } from '../tools/business/signature-generator/SignatureGeneratorTool';
import { VatCalculatorTool } from '../tools/business/vat-calculator/VatCalculatorTool';
import { AverageCalculatorTool } from '../tools/study/average-calculator/AverageCalculatorTool';
import { CitationGeneratorTool } from '../tools/study/citation-generator/CitationGeneratorTool';
import { FlashcardsTool } from '../tools/study/flashcards/FlashcardsTool';
import { GpaCalculatorTool } from '../tools/study/gpa-calculator/GpaCalculatorTool';
import { QuizMakerTool } from '../tools/study/quiz-maker/QuizMakerTool';
import { BillSplitterTool } from '../tools/daily/bill-splitter/BillSplitterTool';
import { DateCalculatorTool } from '../tools/daily/date-calculator/DateCalculatorTool';
import { PasswordGeneratorTool } from '../tools/daily/password-generator/PasswordGeneratorTool';
import { PomodoroTool } from '../tools/daily/pomodoro/PomodoroTool';
import { RandomPickerTool } from '../tools/daily/random-picker/RandomPickerTool';
import { TodoListTool } from '../tools/daily/todo-list/TodoListTool';
import { UnitConverterTool } from '../tools/daily/unit-converter/UnitConverterTool';
import { CaseConverterTool } from '../tools/text/case-converter/CaseConverterTool';
import { LoremGeneratorTool } from '../tools/text/lorem-generator/LoremGeneratorTool';
import { MarkdownPreviewTool } from '../tools/text/markdown-preview/MarkdownPreviewTool';
import { SlugGeneratorTool } from '../tools/text/slug-generator/SlugGeneratorTool';
import { TextCleanerTool } from '../tools/text/text-cleaner/TextCleanerTool';
import { TextFormatterTool } from '../tools/text/text-formatter/TextFormatterTool';
import { WordCounterTool } from '../tools/text/word-counter/WordCounterTool';

export const tools: ToolDefinition[] = [
  {
    id: 'text-formatter',
    slug: 'TextFormater',
    collectionId: 'text',
    name: 'Formateur de texte',
    description: 'Appliquer gras, italique, souligné, barré et style de police.',
    keywords: ['texte', 'format', 'gras'],
    component: TextFormatterTool,
  },
  {
    id: 'word-counter',
    slug: 'WordCounter',
    collectionId: 'text',
    name: 'Compteur de mots',
    description: 'Compter mots, caractères, phrases et temps de lecture.',
    keywords: ['mots', 'compteur', 'lecture'],
    component: WordCounterTool,
  },
  {
    id: 'text-cleaner',
    slug: 'TextCleaner',
    collectionId: 'text',
    name: 'Nettoyeur de texte',
    description: 'Supprimer espaces inutiles, lignes vides et doublons.',
    keywords: ['nettoyer', 'espaces', 'doublons'],
    component: TextCleanerTool,
  },
  {
    id: 'case-converter',
    slug: 'CaseConverter',
    collectionId: 'text',
    name: 'Majuscules / minuscules',
    description: 'Convertir en majuscules, minuscules, phrase ou titre.',
    keywords: ['casse', 'majuscules', 'minuscules'],
    component: CaseConverterTool,
  },
  {
    id: 'slug-generator',
    slug: 'SlugGenerator',
    collectionId: 'text',
    name: 'Generateur de slug',
    description: 'Transformer un titre en URL propre et lisible.',
    keywords: ['slug', 'url', 'seo', 'texte'],
    component: SlugGeneratorTool,
  },
  {
    id: 'lorem-generator',
    slug: 'LoremGenerator',
    collectionId: 'text',
    name: 'Generateur de faux texte',
    description: 'Creer des paragraphes de remplissage pour tester une interface.',
    keywords: ['lorem', 'maquette', 'texte'],
    component: LoremGeneratorTool,
  },
  {
    id: 'markdown-preview',
    slug: 'MarkdownPreview',
    collectionId: 'text',
    name: 'Apercu Markdown',
    description: 'Previsualiser rapidement titres, gras, italique et code inline.',
    keywords: ['markdown', 'preview', 'notes'],
    component: MarkdownPreviewTool,
  },
  {
    id: 'json-formatter',
    slug: 'JsonFormatter',
    collectionId: 'dev',
    name: 'JSON formatter',
    description: 'Valider, formater et minifier du JSON.',
    keywords: ['json', 'formatter', 'dev'],
    component: JsonFormatterTool,
  },
  {
    id: 'base64',
    slug: 'Base64',
    collectionId: 'dev',
    name: 'Base64 encoder / decoder',
    description: 'Encoder et décoder du texte en Base64 UTF-8.',
    keywords: ['base64', 'encode', 'decode'],
    component: Base64Tool,
  },
  {
    id: 'csv-json',
    slug: 'CsvJson',
    collectionId: 'dev',
    name: 'CSV / JSON',
    description: 'Convertir un CSV simple en JSON et inversement.',
    keywords: ['csv', 'json', 'convertir'],
    component: CsvJsonTool,
  },
  {
    id: 'url-codec',
    slug: 'UrlCodec',
    collectionId: 'dev',
    name: 'URL encoder / decoder',
    description: 'Encoder ou decoder une URL pour liens, APIs et parametres.',
    keywords: ['url', 'encode', 'decode'],
    component: UrlCodecTool,
  },
  {
    id: 'hash-generator',
    slug: 'HashGenerator',
    collectionId: 'dev',
    name: 'Generateur de hash',
    description: 'Generer SHA-1, SHA-256, SHA-384 ou SHA-512 depuis du texte.',
    keywords: ['hash', 'sha', 'crypto'],
    component: HashGeneratorTool,
  },
  {
    id: 'uuid-generator',
    slug: 'UuidGenerator',
    collectionId: 'dev',
    name: 'Generateur UUID',
    description: 'Creer des UUID v4 pour tests, prototypes et donnees.',
    keywords: ['uuid', 'id', 'dev'],
    component: UuidGeneratorTool,
  },
  {
    id: 'timestamp-converter',
    slug: 'TimestampConverter',
    collectionId: 'dev',
    name: 'Convertisseur timestamp',
    description: 'Convertir un timestamp Unix en date locale et ISO UTC.',
    keywords: ['timestamp', 'date', 'unix'],
    component: TimestampConverterTool,
  },
  {
    id: 'regex-tester',
    slug: 'RegexTester',
    collectionId: 'dev',
    name: 'Testeur Regex',
    description: 'Tester une expression reguliere et voir les correspondances.',
    keywords: ['regex', 'regexp', 'test'],
    component: RegexTesterTool,
  },
  {
    id: 'pomodoro',
    slug: 'Pomodoro',
    collectionId: 'daily',
    name: 'Minuteur Pomodoro',
    description: 'Gérer des sessions focus et pauses courtes.',
    keywords: ['pomodoro', 'minuteur', 'focus'],
    component: PomodoroTool,
  },
  {
    id: 'password-generator',
    slug: 'PasswordGenerator',
    collectionId: 'daily',
    name: 'Générateur de mot de passe',
    description: 'Créer un mot de passe robuste et copiable.',
    keywords: ['password', 'securite', 'mot de passe'],
    component: PasswordGeneratorTool,
  },
  {
    id: 'unit-converter',
    slug: 'UnitConverter',
    collectionId: 'daily',
    name: 'Convertisseur d’unités',
    description: 'Convertir longueurs, poids et températures.',
    keywords: ['unites', 'conversion', 'quotidien'],
    component: UnitConverterTool,
  },
  {
    id: 'todo-list',
    slug: 'TodoList',
    collectionId: 'daily',
    name: 'Liste de taches',
    description: 'Suivre une liste rapide sauvegardee dans le navigateur.',
    keywords: ['todo', 'taches', 'liste'],
    component: TodoListTool,
  },
  {
    id: 'date-calculator',
    slug: 'DateCalculator',
    collectionId: 'daily',
    name: 'Calculateur de date',
    description: 'Ajouter ou retirer des jours a une date.',
    keywords: ['date', 'jours', 'planning'],
    component: DateCalculatorTool,
  },
  {
    id: 'bill-splitter',
    slug: 'BillSplitter',
    collectionId: 'daily',
    name: 'Partage de facture',
    description: 'Diviser une addition avec pourboire entre plusieurs personnes.',
    keywords: ['facture', 'addition', 'budget'],
    component: BillSplitterTool,
  },
  {
    id: 'random-picker',
    slug: 'RandomPicker',
    collectionId: 'daily',
    name: 'Tirage aleatoire',
    description: 'Choisir au hasard une option dans une liste.',
    keywords: ['random', 'tirage', 'choix'],
    component: RandomPickerTool,
  },
  {
    id: 'qr-code',
    slug: 'QrCode',
    collectionId: 'create',
    name: 'Générateur de QR code',
    description: 'Créer un QR code téléchargeable depuis un texte ou une URL.',
    keywords: ['qr', 'code', 'create'],
    component: QrCodeTool,
  },
  {
    id: 'image-resize',
    slug: 'ImageResize',
    collectionId: 'create',
    name: 'Redimensionneur d’image',
    description: 'Redimensionner une image côté client et télécharger le résultat.',
    keywords: ['image', 'resize', 'canvas'],
    component: ImageResizeTool,
  },
  {
    id: 'color-palette',
    slug: 'ColorPalette',
    collectionId: 'create',
    name: 'Generateur de palette',
    description: 'Creer et copier une palette de couleurs simple.',
    keywords: ['couleur', 'palette', 'design'],
    component: ColorPaletteTool,
  },
  {
    id: 'gradient-generator',
    slug: 'GradientGenerator',
    collectionId: 'create',
    name: 'Generateur de degrade',
    description: 'Composer un degrade CSS et copier son code.',
    keywords: ['gradient', 'css', 'degrade'],
    component: GradientGeneratorTool,
  },
  {
    id: 'average-calculator',
    slug: 'AverageCalculator',
    collectionId: 'study',
    name: 'Calculateur de moyenne',
    description: 'Calculer une moyenne pondérée avec notes et coefficients.',
    keywords: ['moyenne', 'notes', 'study'],
    component: AverageCalculatorTool,
  },
  {
    id: 'flashcards',
    slug: 'Flashcards',
    collectionId: 'study',
    name: 'Fiches de révision',
    description: 'Créer des cartes question / réponse sauvegardées localement.',
    keywords: ['revision', 'fiches', 'cartes'],
    component: FlashcardsTool,
  },
  {
    id: 'quiz-maker',
    slug: 'QuizMaker',
    collectionId: 'study',
    name: 'Createur de quiz',
    description: 'Transformer des lignes question / reponse en mini quiz.',
    keywords: ['quiz', 'revision', 'questions'],
    component: QuizMakerTool,
  },
  {
    id: 'gpa-calculator',
    slug: 'GpaCalculator',
    collectionId: 'study',
    name: 'Calculateur GPA',
    description: 'Estimer un GPA simple sur 4.0 avec credits.',
    keywords: ['gpa', 'notes', 'credits'],
    component: GpaCalculatorTool,
  },
  {
    id: 'citation-generator',
    slug: 'CitationGenerator',
    collectionId: 'study',
    name: 'Generateur de citation',
    description: 'Creer une citation web simple pour une bibliographie.',
    keywords: ['citation', 'bibliographie', 'source'],
    component: CitationGeneratorTool,
  },
  {
    id: 'signature-generator',
    slug: 'EmailSignature',
    collectionId: 'business',
    name: 'Signature email',
    description: 'Générer une signature professionnelle simple en HTML.',
    keywords: ['signature', 'email', 'business'],
    component: SignatureGeneratorTool,
  },
  {
    id: 'margin-calculator',
    slug: 'MarginCalculator',
    collectionId: 'business',
    name: 'Calculateur de marge',
    description: 'Calculer marge, taux de marque et bénéfice.',
    keywords: ['marge', 'prix', 'business'],
    component: MarginCalculatorTool,
  },
  {
    id: 'vat-calculator',
    slug: 'VatCalculator',
    collectionId: 'business',
    name: 'Calculateur TVA',
    description: 'Ajouter une taxe a un montant hors taxe.',
    keywords: ['tva', 'taxe', 'facture'],
    component: VatCalculatorTool,
  },
  {
    id: 'discount-calculator',
    slug: 'DiscountCalculator',
    collectionId: 'business',
    name: 'Calculateur de remise',
    description: 'Calculer un prix final apres reduction.',
    keywords: ['remise', 'reduction', 'prix'],
    component: DiscountCalculatorTool,
  },
  {
    id: 'hourly-rate',
    slug: 'HourlyRate',
    collectionId: 'business',
    name: 'Taux horaire',
    description: 'Estimer un taux horaire depuis un objectif mensuel.',
    keywords: ['freelance', 'horaire', 'tarif'],
    component: HourlyRateTool,
  },
];
