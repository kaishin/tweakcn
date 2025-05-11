import { useState, useCallback } from "react";
import { type ThemeStyles, type ThemeSchema } from "@/types/theme";
import { toast } from "@/components/ui/use-toast";
import {
  createTheme as createThemeAction,
  updateTheme as updateThemeAction,
  deleteTheme as deleteThemeAction,
} from "@/actions/themes";
import { useThemePresetStore } from "@/store/theme-preset-store";

type MutationState<T> = {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
};

export function useThemeActions() {
  const { registerPreset, updatePreset, unregisterPreset } = useThemePresetStore();

  const [createState, setCreateState] = useState<MutationState<ThemeSchema>>({
    isLoading: false,
    error: null,
    data: null,
  });

  const [updateState, setUpdateState] = useState<MutationState<ThemeSchema>>({
    isLoading: false,
    error: null,
    data: null,
  });

  const [deleteState, setDeleteState] = useState<MutationState<boolean>>({
    isLoading: false,
    error: null,
    data: null,
  });

  const handleMutationSuccess = (theme: ThemeSchema | undefined, operation: string) => {
    if (theme) {
      toast({
        title: `Theme ${operation}`,
        description: `Theme "${theme.name}" ${operation.toLowerCase()} successfully.`,
      });
    }
  };

  const createTheme = useCallback(
    async (data: { name: string; styles: ThemeStyles }) => {
      setCreateState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = createThemeAction(data);

        if (result.success && result.theme) {
          const theme = result.theme;
          handleMutationSuccess(theme, "Created");

          registerPreset(theme.id, {
            label: theme.name,
            source: "SAVED",
            createdAt: theme.createdAt.toString(),
            styles: theme.styles,
          });

          setCreateState((prev) => ({ ...prev, isLoading: false, data: theme }));
          return theme;
        } else {
          const error = new Error(result.error || "Failed to create theme");
          setCreateState((prev) => ({ ...prev, isLoading: false, error }));

          toast({
            title: "Operation Failed",
            description: result.error || "Could not create the theme.",
            variant: "destructive",
          });

          return null;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An unexpected error occurred");
        setCreateState((prev) => ({ ...prev, isLoading: false, error }));

        toast({
          title: "Operation Failed",
          description: error.message,
          variant: "destructive",
        });

        return null;
      }
    },
    [registerPreset]
  );

  const updateTheme = useCallback(
    async (data: { id: string; name?: string; styles?: ThemeStyles }) => {
      setUpdateState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = updateThemeAction(data);

        if (result.success && result.theme) {
          const theme = result.theme;
          handleMutationSuccess(theme, "Updated");

          updatePreset(theme.id, {
            label: theme.name,
            source: "SAVED",
            createdAt: theme.createdAt.toString(),
            styles: theme.styles,
          });

          setUpdateState((prev) => ({ ...prev, isLoading: false, data: theme }));
          return theme;
        } else {
          const error = new Error(result.error || "Failed to update theme");
          setUpdateState((prev) => ({ ...prev, isLoading: false, error }));

          toast({
            title: "Operation Failed",
            description: result.error || "Could not update the theme.",
            variant: "destructive",
          });

          return null;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An unexpected error occurred");
        setUpdateState((prev) => ({ ...prev, isLoading: false, error }));

        toast({
          title: "Operation Failed",
          description: error.message,
          variant: "destructive",
        });

        return null;
      }
    },
    [updatePreset]
  );

  const deleteTheme = useCallback(
    async (themeId: string) => {
      setDeleteState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = deleteThemeAction(themeId);

        if (result.success) {
          unregisterPreset(themeId);

          toast({
            title: "Theme Deleted Successfully",
          });

          setDeleteState((prev) => ({ ...prev, isLoading: false, data: true }));
          return true;
        } else {
          const error = new Error(result.error || "Failed to delete theme");
          setDeleteState((prev) => ({ ...prev, isLoading: false, error }));

          toast({
            title: "Operation Failed",
            description: result.error || "Could not delete the theme.",
            variant: "destructive",
          });

          return false;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An unexpected error occurred");
        setDeleteState((prev) => ({ ...prev, isLoading: false, error }));

        toast({
          title: "Operation Failed",
          description: error.message,
          variant: "destructive",
        });

        return false;
      }
    },
    [unregisterPreset]
  );

  return {
    createTheme,
    updateTheme,
    deleteTheme,
    isCreatingTheme: createState.isLoading,
    isUpdatingTheme: updateState.isLoading,
    isDeletingTheme: deleteState.isLoading,
    createError: createState.error,
    updateError: updateState.error,
    deleteError: deleteState.error,
    isMutating: createState.isLoading || updateState.isLoading || deleteState.isLoading,
    mutationError: createState.error || updateState.error || deleteState.error,
  };
}
