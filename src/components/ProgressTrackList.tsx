import { Box, Stack, Typography } from "@mui/material";
import { TrackWithId } from "../features/character-sheet/characterSheet.store";
import { StoredTrack } from "../types/Track.type";
import { AddTrackDialog } from "./AddTrackDialog/AddTrackDialog";
import { ProgressTrack } from "./ProgressTrack/ProgressTrack";

export interface ProgressTrackListProps {
  tracks?: TrackWithId[];
  typeLabel: string;
  handleAdd: (newTrack: StoredTrack) => Promise<boolean>;
  handleUpdateValue: (trackId: string, value: number) => Promise<boolean>;
  handleDeleteTrack: (trackId: string) => Promise<boolean>;
}

export function ProgressTrackList(props: ProgressTrackListProps) {
  const { tracks, typeLabel, handleAdd, handleUpdateValue, handleDeleteTrack } =
    props;

  return (
    <>
      <Box
        bgcolor={(theme) => theme.palette.grey[200]}
        px={2}
        py={0.5}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography
          variant={"h6"}
          fontFamily={(theme) => theme.fontFamilyTitle}
          color={(theme) => theme.palette.text.secondary}
        >
          {typeLabel}s
        </Typography>
        <AddTrackDialog
          trackTypeName={`${typeLabel}`}
          handleTrackAdd={(track) => handleAdd(track)}
          buttonProps={{
            variant: "text",
          }}
        />
      </Box>
      <Stack px={2} mt={2} spacing={4} mb={4}>
        {Array.isArray(tracks) &&
          tracks.map((track, index) => (
            <ProgressTrack
              key={index}
              label={track.label}
              description={track.description}
              difficulty={track.difficulty}
              value={track.value}
              onValueChange={(value) => handleUpdateValue(track.id, value)}
              onDelete={() => {
                handleDeleteTrack(track.id);
              }}
              max={40}
            />
          ))}
      </Stack>
    </>
  );
}