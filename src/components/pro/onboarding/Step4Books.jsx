import { StepPlaceholder } from './StepPlaceholder';

export function Step4Books(props) {
  return (
    <StepPlaceholder
      title="Kirjojen sisällysluettelot"
      description="Kuvaa jokaisen kurssikirjan sisällysluettelo. AI käyttää lukuja tarkkojen kertaussessioiden ja koepreppauksen luomiseen."
      {...props}
    />
  );
}
