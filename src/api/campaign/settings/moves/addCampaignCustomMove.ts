import { CampaignNotFoundException } from "api/error/CampaignNotFoundException";
import { arrayUnion, updateDoc } from "firebase/firestore";
import { ApiFunction, useApiState } from "hooks/useApiState";
import { getCampaignCustomMoveDoc } from "./_getRef";
import { Move } from "types/Moves.type";

export const addCampaignCustomMove: ApiFunction<
  {
    campaignId: string;
    customMove: Move;
  },
  boolean
> = function (params) {
  const { campaignId, customMove } = params;

  return new Promise((resolve, reject) => {
    if (!campaignId) {
      reject(new CampaignNotFoundException());
      return;
    }

    updateDoc(getCampaignCustomMoveDoc(campaignId), {
      moves: arrayUnion(customMove),
    })
      .then(() => {
        resolve(true);
      })
      .catch((e) => {
        console.error(e);
        reject("Failed to add track");
      });
  });
};

export function useAddCampaignCustomMove() {
  const { call, loading, error } = useApiState(addCampaignCustomMove);

  return {
    addCampaignCustomMove: call,
    loading,
    error,
  };
}