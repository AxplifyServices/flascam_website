export type Mission = {
  id?: string;
  title: string;
  description: string;
  displayOrder: number;
  isPublished: boolean;
};

export type KeyFigure = {
  id?: string;
  value: string;
  label: string;
  description?: string | null;
  displayOrder: number;
  isPublished: boolean;
};

export type ExecutiveMember = {
  id?: string;
  fullName: string;
  position: string;
  biography?: string | null;
  imageUrl?: string | null;
  linkedinUrl?: string | null;
  displayOrder: number;
  isPublished: boolean;
};

export type Partner = {
  id?: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  displayOrder: number;
  isPublished: boolean;
};

export type InstitutionalDocument = {
  id?: string;
  title: string;
  description?: string | null;
  documentType?: string | null;
  fileUrl: string;
  fileSizeLabel?: string | null;
  publicationDate?: string | null;
  displayOrder: number;
  isPublished: boolean;
};

export type InstitutionalContent = {
  id?: string;
  slug: string;

  heroEyebrow?: string | null;
  heroTitle: string;
  heroSubtitle?: string | null;

  heroPrimaryCtaLabel?: string | null;
  heroPrimaryCtaUrl?: string | null;

  heroSecondaryCtaLabel?: string | null;
  heroSecondaryCtaUrl?: string | null;

  federationEyebrow?: string | null;
  federationTitle?: string | null;
  federationBody?: string | null;

  missionsEyebrow?: string | null;
  missionsTitle?: string | null;
  missionsBody?: string | null;

  governanceEyebrow?: string | null;
  governanceTitle?: string | null;
  governanceBody?: string | null;

  executiveOfficeEyebrow?: string | null;
  executiveOfficeTitle?: string | null;
  executiveOfficeBody?: string | null;

  partnersEyebrow?: string | null;
  partnersTitle?: string | null;
  partnersBody?: string | null;

  documentsEyebrow?: string | null;
  documentsTitle?: string | null;
  documentsBody?: string | null;

  contactEyebrow?: string | null;
  contactTitle?: string | null;
  contactBody?: string | null;

  contactEmail?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;

  seoTitle?: string | null;
  seoDescription?: string | null;

  isPublished: boolean;

  missions: Mission[];
  keyFigures: KeyFigure[];
  executiveMembers: ExecutiveMember[];
  partners: Partner[];
  documents: InstitutionalDocument[];
};