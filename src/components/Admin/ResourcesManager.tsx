import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResourcesSection from "./Resources/Sections/ResourcesSection";
import { CategoriesManager } from "./CategoriesManager";
import { AttributesManager } from "./AttributesManager";

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
          <CategoriesManager />
        </TabsContent>
        <TabsContent value="attributes" className="mt-4">
          <AttributesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};