export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          created_at: string | null;
          title: string | null;
          status: string | null;
          user_email: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title?: string;
          status?: string;
          user_email?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          status?: string;
          user_email?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
