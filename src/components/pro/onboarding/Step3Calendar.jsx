import { StepPlaceholder } from './StepPlaceholder';

export function Step3Calendar(props) {
  return (
    <StepPlaceholder
      title="Kalenteri & harrastukset"
      description="Lataa ICS-tiedosto urheiluseuran, harrastusten tai töiden kalenterista. AI varaa lukuajat niiden ulkopuolelta."
      {...props}
    />
  );
}
