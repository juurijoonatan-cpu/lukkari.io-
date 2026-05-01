import { StepPlaceholder } from './StepPlaceholder';

export function Step2Schedule(props) {
  return (
    <StepPlaceholder
      title="Lukujärjestys-kuva"
      description="Ota tai lataa kuva oman koulusi tuntikiertokaaviosta. AI tunnistaa palkit ja periodit automaattisesti."
      {...props}
    />
  );
}
