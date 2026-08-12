export interface JobLocationProps {
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export class Location {
  private constructor(
    private readonly location: string | null,
    private readonly city: string | null,
    private readonly state: string | null,
    private readonly country: string | null,
  ) {}

  static create(props: JobLocationProps): Location {
    return new Location(
      props.location?.trim() || null,
      props.city?.trim() || null,
      props.state?.trim() || null,
      props.country?.trim() || null,
    );
  }

  getLocation(): string | null {
    return this.location;
  }

  getCity(): string | null {
    return this.city;
  }

  getState(): string | null {
    return this.state;
  }

  getCountry(): string | null {
    return this.country;
  }
}
