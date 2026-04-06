import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Upload, Loader2, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createOrder, toOrderCode } from "@/lib/orders-api";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Enter a valid email").max(255),
  details: z.string().trim().min(1, "Order details are required").max(2000),
});

type FormData = z.infer<typeof schema>;

export default function Order() {
  const [file, setFile] = useState<File | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const createOrderMutation = useMutation({
    mutationFn: (payload: FormData) => {
      const body = new FormData();
      body.append("fname", payload.firstName);
      body.append("lname", payload.lastName);
      body.append("email", payload.email);
      body.append("details", payload.details);
      if (file) {
        body.append("design", file);
      }
      return createOrder(body);
    },
    onSuccess: (result) => {
      setOrderCode(result.order_code || toOrderCode(result.order_id));
      toast({
        title: "Order submitted",
        description: "Your order was saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    await createOrderMutation.mutateAsync(data);
  };

  const copyId = () => {
    if (orderCode) {
      navigator.clipboard.writeText(orderCode);
      toast({ title: "Copied!", description: "Order ID copied to clipboard." });
    }
  };

  if (orderCode) {
    return (
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="mx-auto max-w-md text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">
            Order Submitted
          </h1>
          <p className="mt-3 text-muted-foreground">
            Your order has been received. Use the ID below to track its status.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-lg border border-border bg-card px-6 py-4">
            <span className="font-heading text-xl font-bold tracking-wide">{orderCode}</span>
            <button onClick={copyId} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy Order ID">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline" onClick={() => setOrderCode(null)}>
              Place Another Order
            </Button>
            <Button asChild>
              <a href="/track">Track Order</a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 py-24 md:py-32">
      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Place an Order</h1>
        <p className="mt-2 text-muted-foreground">
          Fill out the form below and attach your design file. We'll follow up via email.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Order Details</Label>
            <Textarea
              id="details"
              rows={5}
              placeholder="Describe what you need — garment type, quantity, colors, sizes, etc."
              {...register("details")}
            />
            {errors.details && <p className="text-sm text-destructive">{errors.details.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Design File</Label>
            <label
              htmlFor="file"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-card px-6 py-8 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              <Upload className="h-5 w-5" />
              {file ? file.name : "Click to upload your design (PNG, PDF, AI, SVG)"}
              <input
                id="file"
                type="file"
                className="sr-only"
                accept=".png,.jpg,.jpeg,.pdf,.ai,.svg,.eps"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={createOrderMutation.isPending}>
            {createOrderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Order"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
