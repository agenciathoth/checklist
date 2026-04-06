import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nextAuthOptions } from "@/config/auth";
import { s3 } from "@/lib/aws";
import { prismaClient } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

function downloadFilename(path: string, mime: string) {
  const segment = path.split("/").pop() || "video";
  if (/\.[a-z0-9]{2,4}$/i.test(segment)) {
    return segment;
  }
  const sub = mime.includes("/") ? mime.split("/")[1] : "";
  const ext =
    sub === "quicktime"
      ? "mov"
      : sub && sub !== "video"
        ? sub
        : "mp4";
  return `${segment}.${ext}`;
}

function contentDispositionHeader(filename: string) {
  const ascii = filename.replace(/[^\w.\-]+/g, "_");
  const star = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${star}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(nextAuthOptions);

  try {
    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);

    const media = await prismaClient.medias.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            medias: true,
          },
        },
      },
    });

    if (!media) {
      return new NextResponse("Mídia não encontrada", { status: 404 });
    }

    if (!media.type.startsWith("video")) {
      return new NextResponse("Apenas vídeos podem ser baixados", {
        status: 400,
      });
    }

    if (media.task.medias.length !== 1) {
      return new NextResponse(
        "Download disponível apenas para posts com uma única mídia",
        { status: 400 },
      );
    }

    if (media.task.archivedAt && !session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME;
    if (!bucket) {
      console.error("AWS_S3_BUCKET_NAME is not set");
      return new NextResponse("Erro de configuração", { status: 500 });
    }

    const filename = downloadFilename(media.path, media.type);
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: media.path,
      ResponseContentDisposition: contentDispositionHeader(filename),
      ...(media.type.includes("/")
        ? { ResponseContentType: media.type }
        : {}),
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 120 });
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("Requisição inválida", { status: 400 });
    }

    console.error(error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
