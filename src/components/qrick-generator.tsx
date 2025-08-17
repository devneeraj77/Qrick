"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { suggestMarketingHook } from "@/ai/flows/suggest-marketing-hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Download, Sparkles, Loader2, Copy, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function QRickGenerator() {
  const [inputValue, setInputValue] = useState<string>("https://firebase.google.com/");
  const [debouncedValue, setDebouncedValue] = useState<string>(inputValue);
  const [aiHook, setAiHook] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUrl, setIsUrl] = useState<boolean>(false);

  const qrCodeRef = useRef<SVGSVGElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
      try {
        new URL(inputValue);
        setIsUrl(true);
      } catch (_) {
        setIsUrl(false);
        setAiHook("");
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  const handleGenerateHook = async () => {
    if (!isUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL to generate a marketing hook.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setAiHook("");
    try {
      const result = await suggestMarketingHook({ url: debouncedValue });
      setAiHook(result.hook);
      toast({
        title: "Hook Generated!",
        description: "A new marketing hook has been suggested.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate marketing hook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = (format: "svg" | "png") => {
    const svgEl = qrCodeRef.current;
    if (!svgEl) return;

    if (format === "svg") {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, "qrick_qrcode.svg");
      URL.revokeObjectURL(url);
    } else if (format === "png") {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      const img = new Image();
      img.onload = () => {
        const templateSize = 768;
        const qrSize = 354;
        const padding = (templateSize - qrSize) / 2;
        canvas.width = templateSize;
        canvas.height = templateSize;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding, qrSize, qrSize);
        const pngUrl = canvas.toDataURL("image/png");
        triggerDownload(pngUrl, "qrick_qrcode.png");
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const triggerDownload = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const copyHookToClipboard = () => {
    if (!aiHook) return;
    navigator.clipboard.writeText(aiHook).then(() => {
        toast({ title: "Copied!", description: "Marketing hook copied to clipboard." });
    }, () => {
        toast({ title: "Failed to copy", variant: "destructive" });
    });
  }

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  
  const qrVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  }

  return (
    <motion.div variants={cardVariants} initial="initial" animate="animate">
      <Card className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 shadow-2xl shadow-primary/10 overflow-hidden border-border/50">
        <div className="p-8 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 mb-6 text-center">
                <div className="flex items-center justify-center gap-3">
                    <QrCode className="h-10 w-10 text-primary" />
                    <CardTitle className="text-5xl font-bold font-headline">QRick</CardTitle>
                </div>
                <CardDescription className="pt-2">
                    Instantly generate a QR code with an AI-powered marketing twist.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                placeholder="Enter text or URL..."
                value={inputValue}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
                rows={4}
                className="resize-none text-base focus:ring-primary focus:ring-offset-primary/20"
              />
              <AnimatePresence>
              {isUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                >
                <Button onClick={handleGenerateHook} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Suggest Marketing Hook
                </Button>
                </motion.div>
              )}
              </AnimatePresence>
            </CardContent>
          </div>
          
          <AnimatePresence>
            {aiHook && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-primary/10 p-4 rounded-lg border border-primary/20 relative"
              >
                <h4 className="font-semibold text-primary">AI-Powered Suggestion</h4>
                <p className="text-sm mt-1 text-foreground/80">{aiHook}</p>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-primary/80 hover:text-primary hover:bg-primary/20" onClick={copyHookToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-card-foreground/[.03] p-8 flex flex-col items-center justify-center gap-6 border-l border-border/50">
          <motion.div
            key={debouncedValue}
            variants={qrVariants}
            initial="initial"
            animate="animate"
            className="bg-white p-4 rounded-lg shadow-lg"
          >
            {debouncedValue ? (
              <QRCodeSVG
                ref={qrCodeRef}
                value={debouncedValue}
                size={220}
                bgColor={"#ffffff"}
                fgColor={"#1A1A1A"}
                level={"L"}
                includeMargin={false}
              />
            ) : (
              <div className="w-[220px] h-[220px] bg-gray-100 rounded-lg flex items-center justify-center text-center text-sm text-gray-500 p-4">
                Your QR Code will appear here
              </div>
            )}
          </motion.div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="lg" disabled={!debouncedValue} className="w-[220px]">
                    <Download className="mr-2 h-5 w-5" /> Download
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px]">
                <DropdownMenuItem onSelect={() => downloadQRCode('png')}>as PNG</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => downloadQRCode('svg')}>as SVG</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </motion.div>
  );
}
