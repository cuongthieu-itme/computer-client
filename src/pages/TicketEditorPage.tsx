import React, { useState, useEffect, useCallback } from 'react';
// Import TicketContentEditor (default) and PredefinedPlaceholderKey (named)
import TicketContentEditor, { PredefinedPlaceholderKey } from '@/components/TicketContentEditor'; 
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer";   
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Save, Loader2, Eye, EyeOff } from 'lucide-react'; // Removed CheckCircle, Info as they are not directly used here
import * as LucideIcons from 'lucide-react'; // For icon preview and local getLucideIcon

// --- Data Structures (align with backend) ---
interface DetailTabData {
  displayFlag: boolean;
  rawHtml: string;
  headerIcon: keyof typeof LucideIcons | ''; 
}

interface TicketProfile {
  id: string; 
  name: string;
  somethingElse?: string; 
  detailTab1: DetailTabData;
  detailTab2: DetailTabData;
  detailTab3: DetailTabData;
  detailTab4: DetailTabData;
}

// --- API Simulation ---
const FAKE_API = {
  fetchTicketProfile: async (profileId: string): Promise<TicketProfile | null> => {
    await new Promise(resolve => setTimeout(resolve, 700)); 

    const storedProfile = localStorage.getItem(`ticketProfile_${profileId}`);
    if (storedProfile) {
      try {
        return JSON.parse(storedProfile) as TicketProfile;
      } catch (e) {
        console.error("Failed to parse stored profile", e);
      }
    }
    
    if (profileId === "zoo_jb") {
      return {
        id: "zoo_jb",
        name: "Zoo Johor",
        somethingElse: "Managed by Johor Zoo Management Authority",
        detailTab1: { displayFlag: true, rawHtml: "<h1>Welcome to Zoo Johor!</h1><p>Discover amazing animals.</p>", headerIcon: "Landmark" },
        detailTab2: { displayFlag: true, rawHtml: "<h2>Highlights</h2><ul><li>Tiger enclosure</li><li>Bird park</li></ul>", headerIcon: "ListChecks" },
        detailTab3: { displayFlag: true, rawHtml: "<h3>Terms & Conditions</h3><p>Tickets are non-refundable.</p>", headerIcon: "FileText" },
        detailTab4: { displayFlag: false, rawHtml: "", headerIcon: "" },
      };
    }
    return null; 
  },
  saveTicketProfile: async (profileData: TicketProfile): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    localStorage.setItem(`ticketProfile_${profileData.id}`, JSON.stringify(profileData));
    return true; 
  },
};

// Local helper function to get Lucide icon component by name for this page
const getLocalLucideIcon = (name: string): React.ElementType | null => {
  return (LucideIcons as Record<string, React.ElementType>)[name] || null;
};

// Helper component to preview Lucide icons
const IconPreview: React.FC<{ iconName: keyof typeof LucideIcons | '' }> = ({ iconName }) => {
  if (!iconName) {
    return <span className="text-xs text-muted-foreground italic">(No icon)</span>;
  }
  const IconComponent = getLocalLucideIcon(iconName); // Use the local helper
  if (IconComponent) {
    return <IconComponent className="w-5 h-5 text-blue-500" />;
  }
  return <span className="text-xs text-red-500 italic">(Invalid icon: {iconName})</span>;
};


const TicketEditorPage: React.FC = () => {
  const [ticketProfile, setTicketProfile] = useState<TicketProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  const profileIdToEdit = "zoo_jb"; 

  useEffect(() => {
    setIsLoading(true);
    FAKE_API.fetchTicketProfile(profileIdToEdit)
      .then(data => {
        if (data) {
          setTicketProfile(data);
        } else {
          toast({ title: "Error", description: `Profile ${profileIdToEdit} not found.`, variant: "destructive" });
        }
      })
      .catch(err => {
        console.error("Failed to fetch ticket profile:", err);
        toast({ title: "Error", description: "Could not load ticket profile data.", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  }, [profileIdToEdit, toast]);

  const handleDetailTabChange = <K extends keyof DetailTabData>(
    tabKey: keyof Pick<TicketProfile, 'detailTab1' | 'detailTab2' | 'detailTab3' | 'detailTab4'>,
    field: K,
    value: DetailTabData[K]
  ) => {
    setTicketProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [tabKey]: {
          ...prev[tabKey],
          [field]: value,
        },
      };
    });
  };
  
  const handleProfileFieldChange = (field: keyof Pick<TicketProfile, 'name' | 'somethingElse'>, value: string) => {
     setTicketProfile(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };


  const handleSaveChanges = async () => {
    if (!ticketProfile) {
      toast({ title: "Error", description: "No profile data to save.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const success = await FAKE_API.saveTicketProfile(ticketProfile);
      if (success) {
        toast({ title: "Success!", description: `${ticketProfile.name} profile saved.`, className: "bg-green-500 text-white" });
      } else {
        toast({ title: "Save Failed", description: "Could not save ticket profile.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading Ticket Profile Editor...</p>
      </div>
    );
  }

  if (!ticketProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="mt-4 text-lg text-red-600">Failed to load ticket profile data.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const renderDetailTabEditor = (
    tabKey: keyof Pick<TicketProfile, 'detailTab1' | 'detailTab2' | 'detailTab3' | 'detailTab4'>,
    tabTitle: string,
    placeholderKey: PredefinedPlaceholderKey
  ) => {
    const tabData = ticketProfile[tabKey];
    if (!tabData) return null;

    return (
      <Card key={tabKey} className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            {tabTitle}
            <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                <Checkbox
                    id={`${tabKey}-displayFlag`}
                    checked={tabData.displayFlag}
                    onCheckedChange={(checked) => handleDetailTabChange(tabKey, 'displayFlag', !!checked)}
                />
                <Label htmlFor={`${tabKey}-displayFlag`} className="text-sm font-medium flex items-center cursor-pointer">
                    {tabData.displayFlag ? <Eye className="w-4 h-4 mr-1 text-green-500"/> : <EyeOff className="w-4 h-4 mr-1 text-muted-foreground"/>}
                    Display this section
                </Label>
            </div>
          </CardTitle>
          <CardDescription>Manage the content, visibility, and icon for this section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor={`${tabKey}-headerIcon`} className="text-sm font-medium mb-1 block">Header Icon (Lucide Name)</Label>
            <div className="flex items-center gap-2">
              <Input
                id={`${tabKey}-headerIcon`}
                placeholder="e.g., ClipboardList, Info, Star"
                value={tabData.headerIcon}
                onChange={(e) => handleDetailTabChange(tabKey, 'headerIcon', e.target.value as keyof typeof LucideIcons || '')}
                className="flex-grow"
              />
              <div className="p-2 border rounded-md bg-muted/50 min-w-[40px] flex justify-center items-center">
                <IconPreview iconName={tabData.headerIcon} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enter a valid Lucide icon name. Preview appears on the right.
            </p>
          </div>
          
          <TicketContentEditor
            title={`Content for ${tabTitle}`}
            initialContent={tabData.rawHtml}
            placeholderKey={placeholderKey}
            // The onSave prop of TicketContentEditor is for its internal save button,
            // which we are using here to update the specific tab's rawHtml in the page's state.
            // The main "Save All Changes" button on the page will save the entire ticketProfile.
            onSave={(newHtml) => handleDetailTabChange(tabKey, 'rawHtml', newHtml)} 
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-5xl mx-auto shadow-xl">
          <CardHeader className="bg-primary/10 border-b">
            <CardTitle className="text-3xl font-bold text-primary">Ticket Profile Editor</CardTitle>
            <CardDescription className="text-base">
              Manage the details for the ticket profile: <span className="font-semibold">{ticketProfile.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profileName" className="text-sm font-medium">Profile Name</Label>
                  <Input
                    id="profileName"
                    value={ticketProfile.name}
                    onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                    placeholder="e.g., Zoo Johor, Botanic Gardens"
                  />
                </div>
                <div>
                  <Label htmlFor="somethingElse" className="text-sm font-medium">Additional Info (Optional)</Label>
                  <Input
                    id="somethingElse"
                    value={ticketProfile.somethingElse || ""}
                    onChange={(e) => handleProfileFieldChange('somethingElse', e.target.value)}
                    placeholder="e.g., Managed by..."
                  />
                </div>
              </CardContent>
            </Card>

            {renderDetailTabEditor('detailTab1', 'Detail Section 1 (e.g., Introduction)', 'contentBlock1')}
            {renderDetailTabEditor('detailTab2', 'Detail Section 2 (e.g., Highlights)', 'contentBlock2')}
            {renderDetailTabEditor('detailTab3', 'Detail Section 3 (e.g., Terms/Policy)', 'contentBlock3')}
            {renderDetailTabEditor('detailTab4', 'Detail Section 4 (e.g., FAQ/Extra Info)', 'contentBlock4')}

            <div className="flex justify-end pt-6 border-t mt-8">
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save All Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TicketEditorPage;
