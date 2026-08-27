export class CreatePublicJobApplicationCommand {
  constructor(
    public readonly slug: string,
    public readonly applicantName: string,
    public readonly applicantEmail: string,
    public readonly applicantPhone: string,
    public readonly currentLocation?: string | null,
    public readonly highestQualification?: string | null,
    public readonly yearsOfExperience?: number | null,
    public readonly coverLetter?: string | null,
    public readonly remarks?: string | null,
    public readonly resume?: Express.Multer.File | null,
  ) {}
}
