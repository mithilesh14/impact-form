import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadedFile {
  id: string;
  response_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
  created_at: string;
  updated_at: string;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = useCallback(async (
    file: File,
    responseId: string
  ): Promise<UploadedFile | null> => {
    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${responseId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setProgress(100);

      // Save file metadata to database
      const { data: attachment, error: dbError } = await supabase
        .from('attachments')
        .insert({
          response_id: responseId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type,
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insertion fails
        await supabase.storage.from('attachments').remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      setProgress(100);
      return attachment;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [toast]);

  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      // Get file path first
      const { data: attachment, error: fetchError } = await supabase
        .from('attachments')
        .select('file_path')
        .eq('id', fileId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch file info: ${fetchError.message}`);
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([attachment.file_path]);

      if (storageError) {
        throw new Error(`Storage deletion failed: ${storageError.message}`);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('attachments')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }

      return true;
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const getFileUrl = useCallback(async (filePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from('attachments')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to get file URL: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const getAttachments = useCallback(async (responseId: string): Promise<UploadedFile[]> => {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('response_id', responseId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch attachments: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  return {
    uploading,
    progress,
    uploadFile,
    deleteFile,
    getFileUrl,
    getAttachments,
  };
};