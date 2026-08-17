import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { useFonts } from 'expo-font';

export const FONT_MAP = {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
};

export function useAppFonts() {
  return useFonts(FONT_MAP);
}
