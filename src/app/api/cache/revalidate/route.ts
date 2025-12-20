import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

type RevalidatePayload =
  | {
      secret?: string;
      tags?: string[];
      tag?: string;
    }
  | undefined;

const DEFAULT_TAGS = ['properties:list'];

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RevalidatePayload;
    const providedSecret = payload?.secret;
    const secret = process.env.REVALIDATE_SECRET;

    if (secret && providedSecret !== secret) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const tags = resolveTags(payload);

    tags.forEach((tag) => {
      try {
        revalidateTag(tag);
      } catch (error) {
        console.warn('[revalidate] Falha ao revalidar tag', tag, error);
      }
    });

    return NextResponse.json({
      success: true,
      revalidated: tags,
    });
  } catch (error) {
    console.error('[revalidate] Erro inesperado', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao disparar revalidação',
      },
      { status: 500 },
    );
  }
}

function resolveTags(payload: RevalidatePayload): string[] {
  if (!payload) {
    return DEFAULT_TAGS;
  }

  if (Array.isArray(payload.tags) && payload.tags.length > 0) {
    return payload.tags;
  }

  if (payload.tag) {
    return [payload.tag];
  }

  return DEFAULT_TAGS;
}


