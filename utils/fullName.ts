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
}: Pick<ParsedFullName, "firstName" | "lastName">): string | null {
  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();

  if (!trimmedFirst) {
    return "Enter your first name.";
  }
  if (trimmedFirst.length < 2) {
    return "First name must be at least 2 characters.";
  }
  if (!trimmedLast) {
    return "Enter your last name.";
  }
  if (trimmedLast.length < 2) {
    return "Last name must be at least 2 characters.";
  }

  return null;
}
