import { createClient } from '@/lib/supabase/client';
import type {
  Odontogram,
  OdontogramWithTeeth,
  ToothRecord,
  ToothRecordWithDetails,
  ToothSurfaceCondition,
  ToothTreatmentHistory,
  CreateOdontogramInput,
  UpdateToothStatusInput,
  AddSurfaceConditionInput,
  AddTreatmentHistoryInput,
} from '@/types/odontogram';

export class OdontogramService {
  /**
   * Get odontogram for a specific patient
   * Creates one automatically if it doesn't exist
   */
  static async getPatientOdontogram(
    patientId: number
  ): Promise<{ success: boolean; data?: OdontogramWithTeeth; error?: string }> {
    try {
      const supabase = createClient();

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        throw new Error('User not authenticated');
      }

      console.log('Fetching odontogram for patient:', patientId, 'User:', user.id);

      // Check if odontogram exists (simplified query without relations)
      const { data: existing, error: fetchError } = await supabase
        .from('odontograms')
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle();

      console.log('Fetch result:', { existing, fetchError });

      if (fetchError) {
        console.error('Fetch error details:', {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint,
        });
        throw fetchError;
      }

      let odontogram = existing;

      // Create if doesn't exist
      if (!odontogram) {
        console.log('Creating new odontogram for patient:', patientId);
        
        const { data: newOdontogram, error: createError } = await supabase
          .from('odontograms')
          .insert({ 
            patient_id: patientId,
            created_by: user.id  // FIX: Add created_by field
          })
          .select()
          .single();

        console.log('Create result:', { newOdontogram, createError });

        if (createError) {
          console.error('Create error details:', {
            message: createError.message,
            code: createError.code,
            details: createError.details,
            hint: createError.hint,
          });
          console.error('Create error (stringified):', JSON.stringify(createError, null, 2));
          console.error('Create error (full object):', createError);
          throw new Error(createError.message || JSON.stringify(createError) || 'Failed to create odontogram');
        }
        odontogram = newOdontogram;
      }

      // Fetch patient info separately
      const { data: patient } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('id', patientId)
        .single();

      // Fetch all teeth with details
      console.log('Fetching teeth for odontogram:', odontogram.id);
      const { data: teeth, error: teethError } = await supabase
        .from('tooth_records')
        .select('*')
        .eq('odontogram_id', odontogram.id)
        .order('tooth_number');

      console.log('Teeth result:', { count: teeth?.length, teethError });

      if (teethError) {
        console.error('Teeth error:', teethError);
        throw teethError;
      }

      // Fetch surface conditions and treatment history for each tooth
      const teethWithDetails = await Promise.all(
        (teeth || []).map(async (tooth) => {
          const { data: conditions } = await supabase
            .from('tooth_surface_conditions')
            .select('*')
            .eq('tooth_record_id', tooth.id);

          const { data: history } = await supabase
            .from('tooth_treatment_history')
            .select('*')
            .eq('tooth_record_id', tooth.id)
            .order('performed_at', { ascending: false });

          return {
            ...tooth,
            surface_conditions: conditions || [],
            treatment_history: history || [],
          };
        })
      );

      return {
        success: true,
        data: {
          ...odontogram,
          patient: patient || undefined,
          teeth: teethWithDetails,
        } as OdontogramWithTeeth,
      };
    } catch (error: any) {
      console.error('Error fetching odontogram:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        name: error?.name,
        stack: error?.stack,
      });
      return {
        success: false,
        error: error?.message || error?.toString() || 'Failed to fetch odontogram',
      };
    }
  }

  /**
   * Create a new odontogram for a patient
   */
  static async createOdontogram(
    input: CreateOdontogramInput
  ): Promise<{ success: boolean; data?: Odontogram; error?: string }> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('odontograms')
        .insert({ patient_id: input.patient_id })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating odontogram:', error);
      return {
        success: false,
        error: error.message || 'Failed to create odontogram',
      };
    }
  }

  /**
   * Update tooth status
   */
  static async updateToothStatus(
    input: UpdateToothStatusInput
  ): Promise<{ success: boolean; data?: ToothRecord; error?: string }> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('tooth_records')
        .update({
          status: input.status,
          notes: input.notes,
        })
        .eq('id', input.tooth_record_id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating tooth status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update tooth status',
      };
    }
  }

  /**
   * Add surface condition to a tooth
   */
  static async addSurfaceCondition(
    input: AddSurfaceConditionInput
  ): Promise<{ success: boolean; data?: ToothSurfaceCondition; error?: string }> {
    try {
      const supabase = createClient();

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tooth_surface_conditions')
        .insert({
          tooth_record_id: input.tooth_record_id,
          surface: input.surface,
          condition: input.condition,
          material: input.material,
          severity: input.severity,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error adding surface condition:', error);
      return {
        success: false,
        error: error.message || 'Failed to add surface condition',
      };
    }
  }

  /**
   * Remove surface condition
   */
  static async removeSurfaceCondition(
    conditionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('tooth_surface_conditions')
        .delete()
        .eq('id', conditionId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error removing surface condition:', error);
      return {
        success: false,
        error: error.message || 'Failed to remove surface condition',
      };
    }
  }

  /**
   * Add treatment history entry
   */
  static async addTreatmentHistory(
    input: AddTreatmentHistoryInput
  ): Promise<{ success: boolean; data?: ToothTreatmentHistory; error?: string }> {
    try {
      const supabase = createClient();

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tooth_treatment_history')
        .insert({
          tooth_record_id: input.tooth_record_id,
          treatment_type: input.treatment_type,
          description: input.description,
          cost: input.cost,
          notes: input.notes,
          performed_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error adding treatment history:', error);
      return {
        success: false,
        error: error.message || 'Failed to add treatment history',
      };
    }
  }

  /**
   * Get tooth details with all related data
   */
  static async getToothDetails(
    toothRecordId: string
  ): Promise<{ success: boolean; data?: ToothRecordWithDetails; error?: string }> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('tooth_records')
        .select(`
          *,
          surface_conditions:tooth_surface_conditions(*),
          treatment_history:tooth_treatment_history(*)
        `)
        .eq('id', toothRecordId)
        .single();

      if (error) throw error;

      return { success: true, data: data as ToothRecordWithDetails };
    } catch (error: any) {
      console.error('Error fetching tooth details:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tooth details',
      };
    }
  }

  /**
   * Get treatment history for a specific tooth
   */
  static async getToothHistory(
    toothRecordId: string
  ): Promise<{ success: boolean; data?: ToothTreatmentHistory[]; error?: string }> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('tooth_treatment_history')
        .select('*')
        .eq('tooth_record_id', toothRecordId)
        .order('performed_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching tooth history:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tooth history',
      };
    }
  }

  /**
   * Delete treatment history entry
   */
  static async deleteTreatmentHistory(
    historyId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('tooth_treatment_history')
        .delete()
        .eq('id', historyId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting treatment history:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete treatment history',
      };
    }
  }
}
