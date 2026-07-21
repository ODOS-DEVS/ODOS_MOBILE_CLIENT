export type ParsedFullName = {
  firstName: string;
  lastName: string;
  otherNames: string;
};

export function parseFullName(fullName: string): ParsedFullName {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return { firstName: "", lastName: "", otherNames: "" };
  }

  const parts = trimmed.split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "", otherNames: "" };
  }

  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1], otherNames: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts[parts.length - 1],
    otherNames: parts.slice(1, -1).join(" "),
  };
}

export function buildFullName({
  firstName,
  lastName,
  otherNames,
}: ParsedFullName): string {
  return [firstName.trim(), otherNames.trim(), lastName.trim()]
    .filter(Boolean)
    .join(" ");
}

export function validateNameParts({
  firstName,
  lastName,
}: Pick<ParsedFullName, "firstName" | "lastName">): {
  firstName?: string;
  lastName?: string;
} | null {
  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();
  const errors: { firstName?: string; lastName?: string } = {};

  if (!trimmedFirst) {
    errors.firstName = "Enter your first name.";
  } else if (trimmedFirst.length < 2) {
    errors.firstName = "First name must be at least 2 characters.";
  }

  if (!trimmedLast) {
    errors.lastName = "Enter your last name.";
  } else if (trimmedLast.length < 2) {
    errors.lastName = "Last name must be at least 2 characters.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
