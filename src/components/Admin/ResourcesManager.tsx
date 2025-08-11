import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResourcesSection from "./Resources/Sections/ResourcesSection";
import CategoriesSection from "./Resources/Sections/CategoriesSection";
import AttributesSection from "./Resources/Sections/AttributesSection";

export const ResourcesManager = () => {
  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList className="bg-[var(--color-surface)]/70 p-1 rounded-xl grid w-full grid-cols-3 gap-2">
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="attributes">Atributos</TabsTrigger>
        </TabsList>
        <TabsContent value="resources" className="mt-4">
          <ResourcesSection />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoriesSection />
        </TabsContent>
        <TabsContent value="attributes" className="mt-4">
          <AttributesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};