import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";
import type {
  Certification,
  CVData,
  Education,
  Experience,
  Language,
  Personal,
  Skill,
  UploadState,
  WizardStep,
} from "@/types/cv";

interface CVWizardState {
  step: WizardStep;
  cvData: CVData | null;
  uploadState: UploadState;
  uploadError: string | null;
  fileName: string | null;
  isDirty: boolean;

  setStep: (step: WizardStep) => void;
  setCvData: (data: CVData) => void;
  setUploadState: (state: UploadState) => void;
  setUploadError: (msg: string | null) => void;
  setFileName: (name: string | null) => void;

  updatePersonal: (fields: Partial<Personal>) => void;
  updateExperience: (id: string, fields: Partial<Experience>) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  reorderExperiences: (ids: string[]) => void;

  updateEducation: (id: string, fields: Partial<Education>) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;

  updateSkill: (name: string, fields: Partial<Skill>) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (name: string) => void;
  setSkills: (skills: Skill[]) => void;

  updateLanguage: (name: string, fields: Partial<Language>) => void;
  addLanguage: (lang: Language) => void;
  removeLanguage: (name: string) => void;

  addCertification: (cert: Certification) => void;
  updateCertification: (name: string, fields: Partial<Certification>) => void;
  removeCertification: (name: string) => void;

  resetStore: () => void;
}

const initialState = {
  step: 1 as WizardStep,
  cvData: null as CVData | null,
  uploadState: "idle" as UploadState,
  uploadError: null as string | null,
  fileName: null as string | null,
  isDirty: false,
};

function createBlankExperience(): Experience {
  return {
    id: generateId(),
    company: "",
    title: "",
    employment_type: "full-time",
    start_date: "",
    end_date: null,
    is_current: false,
    location: null,
    description: "",
    highlights: [],
  };
}

function createBlankEducation(): Education {
  return {
    id: generateId(),
    institution: "",
    degree: "",
    field_of_study: "",
    start_year: null,
    end_year: null,
    gpa: null,
    description: null,
  };
}

export const useCVWizardStore = create<CVWizardState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      setCvData: (data) => set({ cvData: data, isDirty: false }),

      setUploadState: (uploadState) => set({ uploadState }),

      setUploadError: (uploadError) => set({ uploadError }),

      setFileName: (fileName) => set({ fileName }),

      updatePersonal: (fields) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              personal: { ...state.cvData.personal, ...fields },
            },
          };
        }),

      updateExperience: (id, fields) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              experiences: state.cvData.experiences.map((exp) =>
                exp.id === id ? { ...exp, ...fields } : exp
              ),
            },
          };
        }),

      addExperience: () =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              experiences: [...state.cvData.experiences, createBlankExperience()],
            },
          };
        }),

      removeExperience: (id) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              experiences: state.cvData.experiences.filter((exp) => exp.id !== id),
            },
          };
        }),

      reorderExperiences: (ids) =>
        set((state) => {
          if (!state.cvData) return state;
          const byId = new Map(
            state.cvData.experiences.map((exp) => [exp.id, exp])
          );
          const reordered = ids
            .map((id) => byId.get(id))
            .filter((exp): exp is Experience => exp !== undefined);
          const idSet = new Set(ids);
          const remaining = state.cvData.experiences.filter(
            (exp) => !idSet.has(exp.id)
          );
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              experiences: [...reordered, ...remaining],
            },
          };
        }),

      updateEducation: (id, fields) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              education: state.cvData.education.map((edu) =>
                edu.id === id ? { ...edu, ...fields } : edu
              ),
            },
          };
        }),

      addEducation: () =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              education: [...state.cvData.education, createBlankEducation()],
            },
          };
        }),

      removeEducation: (id) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              education: state.cvData.education.filter((edu) => edu.id !== id),
            },
          };
        }),

      updateSkill: (name, fields) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              skills: state.cvData.skills.map((skill) =>
                skill.name === name ? { ...skill, ...fields } : skill
              ),
            },
          };
        }),

      addSkill: (skill) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              skills: [...state.cvData.skills, skill],
            },
          };
        }),

      removeSkill: (name) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              skills: state.cvData.skills.filter((skill) => skill.name !== name),
            },
          };
        }),

      setSkills: (skills) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: { ...state.cvData, skills },
          };
        }),

      updateLanguage: (name, fields) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              languages: state.cvData.languages.map((lang) =>
                lang.name === name ? { ...lang, ...fields } : lang
              ),
            },
          };
        }),

      addLanguage: (lang) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              languages: [...state.cvData.languages, lang],
            },
          };
        }),

      removeLanguage: (name) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              languages: state.cvData.languages.filter((lang) => lang.name !== name),
            },
          };
        }),

      addCertification: (cert) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              certifications: [...state.cvData.certifications, cert],
            },
          };
        }),

      updateCertification: (name, fields) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              certifications: state.cvData.certifications.map((cert) =>
                cert.name === name ? { ...cert, ...fields } : cert
              ),
            },
          };
        }),

      removeCertification: (name) =>
        set((state) => {
          if (!state.cvData) return state;
          return {
            isDirty: true,
            cvData: {
              ...state.cvData,
              certifications: state.cvData.certifications.filter(
                (cert) => cert.name !== name
              ),
            },
          };
        }),

      resetStore: () => {
        useCVWizardStore.persist.clearStorage();
        set(initialState);
      },
    }),
    {
      name: "cv-wizard-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step,
        cvData: state.cvData,
        fileName: state.fileName,
        isDirty: state.isDirty,
      }),
    }
  )
);

export { useCVWizardStore as useWizardStore };
export type { WizardStep, UploadState } from "@/types/cv";
