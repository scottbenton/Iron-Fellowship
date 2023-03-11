import {
  arrayRemove,
  arrayUnion,
  deleteField,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { ApiFunction, useApiState } from "hooks/useApiState";
import { getCharacterCustomMovesDoc } from "./_getRef";
import { StoredMove } from "types/Moves.type";
import { firestore } from "config/firebase.config";
import { UserNotLoggedInException } from "api/error/UserNotLoggedInException";
import { CharacterNotFoundException } from "api/error/CharacterNotFoundException";
import { useCharacterSheetStore } from "features/character-sheet/characterSheet.store";
import { useAuth } from "hooks/useAuth";
import { encodeDataswornId } from "functions/dataswornIdEncoder";

export const updateCharacterCustomMove: ApiFunction<
  {
    uid?: string;
    characterId?: string;
    moveId: string;
    customMove: StoredMove;
  },
  boolean
> = function (params) {
  const { uid, characterId, moveId, customMove } = params;

  return new Promise((resolve, reject) => {
    if (!uid) {
      reject(new UserNotLoggedInException());
      return;
    }

    if (!characterId) {
      reject(new CharacterNotFoundException());
      return;
    }

    const encodedId = encodeDataswornId(customMove.$id);
    if (moveId !== customMove.$id) {
      const oldEncodedId = encodeDataswornId(moveId);
      const batch = writeBatch(firestore);
      batch.update(getCharacterCustomMovesDoc(uid, characterId), {
        [`moves.${encodedId}`]: customMove,
        [`moves.${oldEncodedId}`]: deleteField(),
        moveOrder: arrayRemove(oldEncodedId),
      });
      batch.update(getCharacterCustomMovesDoc(uid, characterId), {
        moveOrder: arrayUnion(encodedId),
      });

      batch
        .commit()
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          console.error(err);
          reject("Failed to update custom campaign move");
        });
    } else {
      updateDoc(getCharacterCustomMovesDoc(uid, characterId), {
        [`moves.${encodedId}`]: customMove,
      })
        .then(() => {
          resolve(true);
        })
        .catch((e) => {
          console.error(e);
          reject("Failed to add track");
        });
    }
  });
};

export function useUpdateCharacterCustomMove() {
  const { call, loading, error } = useApiState(updateCharacterCustomMove);

  return {
    updateCharacterCustomMove: call,
    loading,
    error,
  };
}

export function useCharacterSheetUpdateCustomMove() {
  const { updateCharacterCustomMove, loading, error } =
    useUpdateCharacterCustomMove();

  const uid = useAuth().user?.uid;
  const characterId = useCharacterSheetStore((store) => store.characterId);

  return {
    updateCharacterCustomMove: (moveId: string, move: StoredMove) =>
      updateCharacterCustomMove({ uid, characterId, moveId, customMove: move }),
    loading,
    error,
  };
}
