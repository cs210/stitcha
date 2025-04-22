export const prerender = false;

import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

export async function POST(request: Request) {
  try {
    console.log('Processing PDF...');
    const file = await request.blob();

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');

    const apiUrl = 'https://us-documentai.googleapis.com/v1/projects/490247483255/locations/us/processors/a02e7a420cb62c20:process';

    // Load credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '');
    
    // Create auth client
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    // Get auth client
    const client = await auth.getClient();
    
    // Get access token
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to get access token');
    }

    let apiResponse;
    try {
      apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify({
          rawDocument: {
            content: base64String,
            mimeType: 'application/pdf',
          },
        }),
      });
    } catch (error) {
      console.error('Error processing PDF (API ERROR):', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to process PDF' },
        { status: 500 }
      );
    }

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Document AI API error (${apiResponse.status}): ${errorText}`);
    }

    const result = await apiResponse.json();

    if (!result.document?.text) {
      throw new Error('No text content found in document');
    }
    

    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields);
    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[0].fieldName.textAnchor);
    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[0].fieldValue.textAnchor);

    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[1].fieldName.textAnchor);
    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[1].fieldValue.textAnchor);

    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[2].fieldName.textAnchor);
    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[2].fieldValue.textAnchor);

    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[2].fieldName.textAnchor);
    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[2].fieldValue.textAnchor);

    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[3].fieldName.textAnchor);
    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[3].fieldValue.textAnchor);

    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[4].fieldName.textAnchor);
    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[4].fieldValue.textAnchor);

    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[5].fieldName.textAnchor);
    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[5].fieldValue.textAnchor);

    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[6].fieldName.textAnchor);
    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[6].fieldValue.textAnchor);

    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[7].fieldName.textAnchor);
    // console.log("RESULT.document.pages.formfields:",result.document.pages[0].formFields[7].fieldValue.textAnchor);

    // console.log("LINES:",result.document.pages[0].lines[0]);
    // console.log("LINES:",result.document.pages[0].paragraphs[0]);

    console.log("RESULT:",result.document);
    console.log("RESULT TEXT:",result.document.text);

    // const text = JSON.stringify(result.document.text);

    // console.log("TEXT:",text);



    // Process the extracted text and structure it according to your needs
    // const extractedData = {
    //   productName: '',
    //   systemCode: '',
    //   inmetroCert: '',
    //   barcode: '',
    //   description: '',
    //   dimensions: {
    //     weight: 0,
    //     width: 0,
    //     height: 0
    //   },
    //   materials: [],
    //   labor: [],
    //   generalExpenses: 0,
    //   royalties: 0,
    //   sellingPrice: 0
    // };

    return NextResponse.json({ extractedData: result });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
