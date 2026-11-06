function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function toPlainText(value) {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, "• ")
      .replace(/<\/(p|li|div|ul|ol|pre|h[1-6])\s*>/gi, "\n")
      .replace(/<[^>]*>/g, "")
  )
    .replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n")
    .trim();
}

function parseLegacyHtmlSteps(description) {
  const html = decodeHtmlEntities(description);
  const headings = [...html.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)];
  if (headings.length === 0) return null;

  return headings.map((heading, index) => {
    const bodyStart = heading.index + heading[0].length;
    const bodyEnd = headings[index + 1]?.index ?? html.length;
    const body = html.slice(bodyStart, bodyEnd);
    const commandMatches = [...body.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi)];
    const command = commandMatches
      .map((match) => toPlainText(match[1]))
      .filter(Boolean)
      .join("\n");
    const descriptionWithoutCommands = body.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, "");

    return {
      title: toPlainText(heading[1]) || `Langkah ${index + 1}`,
      description: toPlainText(descriptionWithoutCommands),
      command,
    };
  });
}

function normalizeSteps(steps) {
  if (!Array.isArray(steps)) return [];

  return steps
    .filter((step) => step && typeof step === "object")
    .map((step, index) => {
      const title = String(step.title ?? "").trim();
      const description = String(step.description ?? step.deskripsi ?? "").trim();
      const command = String(step.command ?? step.perintah ?? "").trim();

      return {
        title: title || `Langkah ${index + 1}`,
        description,
        command,
        hasContent: Boolean(title || description || command),
      };
    })
    .filter((step) => step.hasContent)
    .map(({ hasContent, ...step }) => step);
}

export function parseSubmittedSteps(formData) {
  const rawSteps = formData.get("steps");

  if (typeof rawSteps !== "string" || !rawSteps.trim()) {
    const legacyContent = parseTutorialContent({
      deskripsi: String(formData.get("deskripsi") ?? ""),
      command: String(formData.get("command") ?? ""),
    });
    const steps = legacyContent.steps.filter((step) => step.description || step.command);
    if (steps.length === 0) {
      throw new Error("Isi minimal satu langkah solusi.");
    }
    return steps;
  }

  let submittedSteps;
  try {
    submittedSteps = JSON.parse(rawSteps);
  } catch {
    throw new Error("Format data langkah tidak valid.");
  }

  if (!Array.isArray(submittedSteps)) {
    throw new Error("Data langkah harus berupa daftar.");
  }

  const steps = normalizeSteps(submittedSteps);
  if (steps.length === 0) {
    throw new Error("Isi minimal satu langkah solusi.");
  }

  return steps;
}

export function parseTutorialContent(rawContent) {
  let content = rawContent;

  if (typeof rawContent === "string") {
    try {
      content = JSON.parse(rawContent);
    } catch {
      content = { deskripsi: rawContent };
    }
  }

  if (content && typeof content === "object" && !Array.isArray(content)) {
    const imageUrl = String(content.imageUrl ?? content.gambar ?? "").trim();
    const legacyDescription = String(
      content.deskripsi ?? content.penjelasan ?? ""
    );
    const legacyCommand = String(content.command ?? content.perintah ?? "").trim();
    let steps = normalizeSteps(content.steps);

    if (steps.length === 0) {
      steps = parseLegacyHtmlSteps(legacyDescription) || [];
    }

    if (steps.length === 0 && legacyDescription.trim()) {
      steps = [{
        title: "Langkah 1",
        description: toPlainText(legacyDescription),
        command: "",
      }];
    }

    if (steps.length === 0) {
      steps = [{ title: "Langkah 1", description: "", command: "" }];
    }

    if (legacyCommand && !steps.some((step) => step.command)) {
      steps[0] = { ...steps[0], command: legacyCommand };
    }

    return {
      steps,
      imageUrl,
      deskripsi: steps.map((step) => step.description).filter(Boolean).join("\n\n"),
      command: steps.map((step) => step.command).filter(Boolean).join("\n"),
    };
  }

  return {
    steps: [{ title: "Langkah 1", description: "", command: "" }],
    imageUrl: "",
    deskripsi: "",
    command: "",
  };
}
