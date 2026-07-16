import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Questionnaire } from "./questionnaire";
import type { SymptomQuestion } from "@/features/screening/types";

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerMocks.push,
    replace: routerMocks.replace,
    back: routerMocks.back,
    refresh: routerMocks.refresh,
  }),
}));

vi.mock("@/components/brand", () => ({
  Brand: () => <div>RuangPulih</div>,
}));

const questions: SymptomQuestion[] = [
  {
    id:
      "11111111-1111-4111-8111-111111111111",

    code: "G001",
    name: "Suasana hati menurun",

    question:
      "Seberapa sering Anda merasa sedih?",

    explanation:
      "Penjelasan pertanyaan pertama.",

    is_crisis: false,
    display_order: 1,
  },
  {
    id:
      "22222222-2222-4222-8222-222222222222",

    code: "G002",
    name: "Kesulitan berkonsentrasi",

    question:
      "Seberapa sering Anda kesulitan berkonsentrasi?",

    explanation:
      "Penjelasan pertanyaan kedua.",

    is_crisis: false,
    display_order: 2,
  },
];

describe("Questionnaire", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    sessionStorage.setItem(
      "screeningConsent",
      new Date().toISOString(),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("menampilkan pertanyaan pertama", () => {
    render(
      <Questionnaire
        questions={questions}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: questions[0].question,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("1 dari 2"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("progressbar"),
    ).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
  });

  it("berpindah ke pertanyaan berikutnya", async () => {
    const user = userEvent.setup();

    render(
      <Questionnaire
        questions={questions}
      />,
    );

    await user.click(
      screen.getByRole("radio", {
        name: /beberapa hari/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /^lanjut$/i,
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: questions[1].question,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("2 dari 2"),
    ).toBeInTheDocument();
  });

  it("mengirim jawaban dan membuka halaman hasil", async () => {
    const user = userEvent.setup();

    const payload = {
      status: "success",

      data: {
        results: [],
        topResult: null,
        consultationId: null,
        saved: false,
      },

      disclaimer:
        "Hasil bukan diagnosis medis.",
    };

    const fetchMock = vi.fn<
      typeof fetch
    >();

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify(payload),
        {
          status: 200,

          headers: {
            "Content-Type":
              "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    render(
      <Questionnaire
        questions={questions}
      />,
    );

    await user.click(
      screen.getByRole("radio", {
        name: /beberapa hari/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /^lanjut$/i,
      }),
    );

    await user.click(
      screen.getByRole("radio", {
        name: /hampir setiap hari/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /lihat hasil/i,
      }),
    );

    await waitFor(() => {
      expect(
        routerMocks.push,
      ).toHaveBeenCalledWith(
        "/skrining/hasil",
      );
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/inference",

      expect.objectContaining({
        method: "POST",
      }),
    );

    expect(
      sessionStorage.getItem(
        "screeningResult",
      ),
    ).toBe(JSON.stringify(payload));
  });

  it("mengarahkan ke persetujuan jika consent tidak tersedia", async () => {
    const user = userEvent.setup();

    sessionStorage.removeItem(
      "screeningConsent",
    );

    render(
      <Questionnaire
        questions={[
          questions[0],
        ]}
      />,
    );

    await user.click(
      screen.getByRole("radio", {
        name: /tidak pernah/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /lihat hasil/i,
      }),
    );

    await waitFor(() => {
      expect(
        routerMocks.replace,
      ).toHaveBeenCalledWith(
        "/skrining/persetujuan",
      );
    });
  });
});
